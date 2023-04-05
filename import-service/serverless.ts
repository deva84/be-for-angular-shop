import type { AWS } from '@serverless/typescript';
import { config } from 'dotenv';
import {importFileParser, importProductsFile} from "@functions/index";

config();

const serverlessConfiguration: AWS = {
  service: 'import--and-parse-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: `arn:aws:s3:::import-and-parse-s3-bucket/*`,
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: `arn:aws:s3:::import-and-parse-s3-bucket/*`,
      },
      {
        Effect: 'Allow',
        Action: 'sqs:SendMessage',
        Resource: 'arn:aws:sqs:us-east-1:843522005613:catalogItemsQueue',
      },
    ],
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      IMPORT_BUCKET: 'import-and-parse-s3-bucket',
      SQS_URL: 'https://sqs.us-east-1.amazonaws.com/843522005613/catalogItemsQueue',
    },
    s3: {
      importsBucket: {
        name: 'import-and-parse-s3-bucket',
        corsConfiguration: {
          CorsRules: [
            {
              AllowedMethods: ['GET', 'PUT', 'HEAD', 'DELETE'],
              AllowedHeaders: ['*'],
              AllowedOrigins: ['*'],
            },
          ],
        },
        notificationConfiguration: {
          LambdaConfigurations: [
            {
              Event: 's3:ObjectCreated:*',
              Filter: {
                S3Key: {
                  Rules: [
                    { Name: 'prefix', Value: 'uploaded/' },
                    { Name: 'suffix', Value: '.csv' },
                  ],
                },
              },
              Function: { 'Fn::GetAtt': ['ImportFileParserLambdaFunction', 'Arn'] },
            },
          ],
        },
      },
    },
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
