import {dataService} from "../../data-service/data.service";
import {formatJSONResponse} from "../../libs/api-gateway";
import {middyfy} from "../../libs/lambda";
import createHttpError from "http-errors";

export const getProductsById = async (event) => {
    try {
        const id = event.pathParameters?.productId;
        const product = await dataService.getProductById(id);
        if (product) {
            return formatJSONResponse(200, product);
        } else {
            const response = new createHttpError.NotFound(
                `Product ID: '${id}' was not found!`
            );
            return formatJSONResponse(response.statusCode, response.message);
        }

    } catch (error) {
        const response = new createHttpError.InternalServerError(error.message);
        return formatJSONResponse(response.statusCode, response.message);
    }
};


export const getProductsByIdHandler = middyfy(getProductsById);
