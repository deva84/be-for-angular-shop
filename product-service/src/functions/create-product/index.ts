import {handlerPath} from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/create-product.createProduct`,
  events: [
    {
      http: {
        method: 'post',
        path: '/products',
      },
    },
  ],
};
