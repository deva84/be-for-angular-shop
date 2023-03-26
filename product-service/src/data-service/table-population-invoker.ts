import * as mockData from "./data.json";
import {Product} from '../models/product';
import {addItem, ProductTableItem, StockTableItem} from "./data.service.helpers";
import {ErrorTypes} from "../errors/error-types";

interface MockData {
    default: Product[];
}

const initialData = mockData as unknown as MockData;

const populateProductTable = async () => {
    try {
        for (const dataItem of initialData.default) {
            let item: ProductTableItem = {
                id: dataItem.id,
                title: dataItem.title,
                description: dataItem.description,
                img: dataItem.img,
                price: dataItem.price
            }
            await addItem('product_table', item);
            console.log(`Product ID: ${dataItem.id} was added to the product table`);
        }
    } catch (err) {
        throw {name: ErrorTypes.SERVER_ERROR, message: err.message};
    }
}

const populateStockTable = async () => {
    try {
        for (const dataItem of initialData.default) {
            let item: StockTableItem = {
                product_id: dataItem.id,
                count: dataItem.count
            }
            await addItem('stock_table', item);
            console.log(`Product ID: ${dataItem.id} was added to the stock table`)
        }
    } catch (err) {
        throw {name: ErrorTypes.SERVER_ERROR, message: err.message};
    }
}

populateProductTable().then(() => console.log('Product table is populated!'));
populateStockTable().then(() => console.log('Stock table is populated!'));
