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
            },
        },
    ],
};
