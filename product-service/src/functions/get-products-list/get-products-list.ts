import 'source-map-support/register';
import {formatJSONResponse} from '../../libs/api-gateway';
import {middyfy} from '../../libs/lambda';
import createHttpError from 'http-errors';
import {dataService} from "../../data-service/data.service";


export const getProductsList = async () => {
    console.log('Get Product List Event triggered');
    try {
        const products = await dataService.getAllProducts();
        return formatJSONResponse(200, products);
    } catch (error) {
        const response = new createHttpError.InternalServerError(error.message);
        return formatJSONResponse(response.statusCode, response.message);
    }
};


export const getProductsListHandler = middyfy(getProductsList);
