import {Product} from "../models/product";
import {dynamoDb} from "./dynamo-db-client";
import {addItem, ProductTableItem, StockTableItem} from "./data.service.helpers";
import { v4 as uuidv4 } from 'uuid';
import * as console from "console";
import {ErrorTypes} from "../errors/error-types";

export class DataService {
  private static instance: DataService;
  private dynamoDb = dynamoDb;
  private productTable = 'product_table';
  private stockTable = 'stock_table';

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  getAllProducts(): Promise<Product[]> {
    const productTableData = this.dynamoDb.scan({TableName: this.productTable}).promise();
    const stockTableData = this.dynamoDb.scan({TableName: this.stockTable}).promise();

    return Promise.all([productTableData, stockTableData]).then(([products, stocks]) => {
      const stockItems = stocks?.Items as StockTableItem[];
      return products?.Items.map((product) => {
        const productCopy = {...product} as ProductTableItem;
        const productCount = stockItems.find((item) => item.product_id === productCopy.id)?.count;
        if (productCount) {
          return {...productCopy, count: productCount} as Product;
        }
      })
    });
  }

  getProductById(id: string): Promise<Product> {
    const productItem = this.dynamoDb
    .query({ TableName: this.productTable, KeyConditionExpression: 'id = :id', ExpressionAttributeValues: {':id': id} })
    .promise();
    const stockItem = this.dynamoDb
    .query({ TableName: this.stockTable,  KeyConditionExpression: 'product_id = :product_id', ExpressionAttributeValues: {':product_id': id} })
    .promise();

    return Promise.all([productItem, stockItem]).then(([product, stock]) => {
      const productCount = stock?.Items[0]?.count;
      if (!product || !stock || !productCount) {
        throw {name: ErrorTypes.NOT_FOUND, message: `Product ID: ${id} was not found in stock!`};
      } else {
        return {...product.Items[0], count: productCount} as Product;
      }
    });
  }

  createProduct(item: Omit<Product, 'id'>): Promise<Product[]> {
    const productTableItem: ProductTableItem = {
      id: uuidv4(),
      title: item.title,
      description: item.description,
      img: item.img || 'https://source.unsplash.com/random',
      price: item.price,
    };
    const stockTableItem: StockTableItem = {
      product_id: productTableItem.id,
      count: item.count || 1,
    }

    const addProductItem = addItem(this.productTable, productTableItem);
    const addStockItem = addItem(this.stockTable, stockTableItem);

    return Promise.all([addProductItem, addStockItem]).then(() => {
      console.log(`New product ${JSON.stringify(item)}, ID: ${productTableItem.id} was successfully created!`);
      return this.getAllProducts();
    });
  }
}

export const dataService = DataService.getInstance();
