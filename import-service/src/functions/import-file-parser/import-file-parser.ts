import {formatJSONResponse} from '../../libs/api-gateway';
import {middyfy} from '../../libs/lambda';
import createHttpError from 'http-errors';
import {ImportServiceMiddleware} from "../../service/import-service-middleware";

export const importFileParser = async (event) => {
    console.log('importFileParser is called with', event);
    try {
        const records = event.Records;
        const importService = new ImportServiceMiddleware();
        await importService.handleFileImport(records);
        return formatJSONResponse(200, 'OK');
    } catch (error) {
        const response = new createHttpError.InternalServerError(error.message);
        return formatJSONResponse(response.statusCode, response.message);
    }

};

export const importFileParserHandler = middyfy(importFileParser);
