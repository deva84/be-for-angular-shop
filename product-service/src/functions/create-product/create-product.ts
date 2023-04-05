import {dataService} from "../../data-service/data.service";
import {formatJSONResponse} from "../../libs/api-gateway";
import {middyfy} from "../../libs/lambda";
import createHttpError from "http-errors";

export const createProduct = async (event) => {
  console.log('Create Product Event triggered: ', event);
  try {
    const { title, description, price, img, count }= JSON.parse(event.body);

    if (!title || !description || !price) {
      const response = new createHttpError.BadRequest('Invalid data!');
      return formatJSONResponse(response.statusCode, response.message);
    }

    const response = await dataService.createProduct({title, description, price, img, count});
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
    }

  } catch (error) {
    const response = new createHttpError.InternalServerError(error.message);
    return formatJSONResponse(response.statusCode, response.message);
  }
};


export const getCreateProductHandler = middyfy(createProduct);
