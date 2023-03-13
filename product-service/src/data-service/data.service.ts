import * as mockData from './data.json';
import { Product } from "../models/product";

export class DataService {
    private static instance: DataService;
    private data: Product[] = mockData;

    static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }

    getAllProducts(): Promise<Product[]> {
        return Promise.resolve(this.data)
    }

    getProductById(id: string): Promise<Product> {
        return this.getAllProducts().then((products) => {
            return products.find((product) => product.id === id);
        });
    }
}

export const dataService = DataService.getInstance();
