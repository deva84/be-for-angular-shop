import * as AWS from 'aws-sdk';

export const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1'
});
