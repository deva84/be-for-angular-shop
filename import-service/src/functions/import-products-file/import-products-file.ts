import {formatJSONResponse} from '../../libs/api-gateway';
import {middyfy} from '../../libs/lambda';
import createHttpError from 'http-errors';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {s3Client} from "../../common/client";
import {config} from 'dotenv';
import {PutObjectCommand} from "@aws-sdk/client-s3";

config();

export const importProductsFile = async (event) => {
    console.log('importProductsFile is called');
    try {
        if (!event.queryStringParameters || !event.queryStringParameters.fileName) {
            const errorMessage = 'Filename is required!'
            const response = new createHttpError.BadRequest(errorMessage);

            return formatJSONResponse(response.statusCode, response.message);
        }
        const fileName = event.queryStringParameters.fileName
        console.log('importProductFile is called with', fileName);
        const command = new PutObjectCommand({
            Bucket: 'import-and-parse-s3-bucket',
            Key: `uploaded/${fileName}`,
            ContentType: 'text/csv',
        })
        const signedUrl = await getSignedUrl(s3Client,command, {
            expiresIn: 3600,

        });

        return {
          statusCode: 200,
          body: signedUrl,
          headers: {
            "Access-Control-Allow-Origin": "https://dsu9vo4edfzlb.cloudfront.net",
            //@ts-ignore
            "Access-Control-Allow-Credentials": true
          }
        };

    } catch (error) {
        console.log('Function "importProductFile" returned an error: ', error);
        const response = new createHttpError.InternalServerError(error.message);

        return formatJSONResponse(response.statusCode, response.message);
    }
};

export const importProductsFileHandler = middyfy(importProductsFile);
