import type {AWS} from '@serverless/typescript';
import {getProductsList} from "./src/functions";
import {getProductsById} from "./src/functions";
import {createProduct} from "./src/functions";

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: [
          `arn:aws:dynamodb:\${self:provider.region}:*:table/product_table`,
          `arn:aws:dynamodb:\${self:provider.region}:*:table/stock_table`
        ]
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCT_TABLE: 'product_table',
      STOCK_TABLE: 'stock_table'
    },
  },
  resources: {
    Resources: {
      ProductsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.PRODUCT_TABLE}',
          AttributeDefinitions: [
            {AttributeName: 'id', AttributeType: 'S'},
          ],
          KeySchema: [
            {AttributeName: 'id', KeyType: 'HASH'}
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        }
      },
      StocksTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.STOCK_TABLE}',
          AttributeDefinitions: [
            {AttributeName: 'product_id', AttributeType: 'S'}
          ],
          KeySchema: [
            {AttributeName: 'product_id', KeyType: 'HASH'}
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          }
        },
      }
    }
  },

  // import the function via paths
  functions: {getProductsList, getProductsById, createProduct},
  package: {individually: true},
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
