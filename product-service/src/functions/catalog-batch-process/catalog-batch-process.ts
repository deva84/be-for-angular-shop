import { formatJSONResponse } from '@libs/api-gateway';
import { SQSEvent } from 'aws-lambda';
import { SNS } from 'aws-sdk';
import { dataService } from 'src/data-service/data.service';
import createHttpError from 'http-errors';

const sns = new SNS({ region: 'eu-west-1' });

export const catalogBatchProcess = async (event: SQSEvent) => {
    try {
        const batch = [];
        const products = event.Records.map(({ body }) => {
            const productData = JSON.parse(body);

            const newProduct = dataService.createProduct(productData);
            batch.push(newProduct);
           
        });

        await Promise.all(products);

        sns.publish({
            Subject: 'Product list extended',
            Message: JSON.stringify(batch),
            TopicArn: process.env.SNS_ARN
        });
        console.log('Products were created!')
        return formatJSONResponse(200, batch);
        
    } catch (error) {
        console.log('Failed to create new products with error: ', error);
        const response = new createHttpError.InternalServerError(error.message);
        return formatJSONResponse(response.statusCode, response.message);
    }
};