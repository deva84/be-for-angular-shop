import {handlerPath} from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/import-products-file.importProductsFile`,
    events: [
        {
            http: {
                method: 'get',
                path: 'import',
                request: {
                    parameters: {
                        querystrings: {
                            fileName: { required: true },
                        },
                    },
                },
                authorizer: {
                  name: 'basicAuthorizer',
                  arn: 'arn:aws:lambda:us-east-1:843522005613:function:authorization-service-dev-basicAuthorizer',
                  // resultTtlInSeconds: 0,
                  identitySource: 'method.request.header.Authorization',
                  type: 'token',
                },
            },
        },
    ],
};
