import {handlerPath} from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/get-products-list.getProductsList`,
    events: [
        {
            http: {
                method: 'get',
                path: 'products',
            },
        },
    ],
};
