import {dynamoDb} from "./dynamo-db-client";
import {ErrorTypes} from "../errors/error-types";

export interface ProductTableItem {
  id: string;
  title: string;
  description: string;
  img: string;
  price: number;
}

export interface StockTableItem {
  product_id: string;
  count: number;
}


export const addItem = async (tableName: string, item: ProductTableItem | StockTableItem) => {
  try {
    return await dynamoDb.put({TableName: tableName, Item: item}).promise();
  } catch (err) {
    throw {name: ErrorTypes.BAD_REQUEST, message: err.message}
  }
};
