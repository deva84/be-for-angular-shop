import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/catalog-batch-process.catalogBatchProcess`,
  events: [
    {
      sqs: {
        batchSize: 5,
        arn: {'Fn::GetAtt': ['sqsQueue', 'Arn']}
      },
    },
  ],
};