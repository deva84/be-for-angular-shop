import csvParser from "csv-parser";
import {config} from 'dotenv';
import {SQS, S3} from 'aws-sdk';

config();
export class ImportServiceMiddleware {
  private uploadedFolder = 'uploaded';
  private parsedFolder = 'parsed';
  private sqs = new SQS();
  private s3 = new S3({ region: 'eu-west-1' });

  async handleFileImport(records): Promise<any> {
    const s3Event = records[0].s3;
    const bucket = s3Event.bucket.name;
    const key = s3Event.object.key;

    const s3ReadStream = await this.s3.getObject({
      Bucket: bucket,
      Key: key
    }).createReadStream();

    s3ReadStream.pipe(csvParser({ separator: ',' }))
      .on('data', (data) => {
        this.sqs.sendMessage({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(data).replace(/\ufeff/g, '')
        }, (error, data) => {
          if (error) {
            console.log('Failed to send to SQS queue with an error: ', error);
            throw error;
          }
          console.log('Sent to SQS:', JSON.stringify(data));
        });
      })
      .on('end', () => {
        console.log('End of stream');
        try {
          const copyParams = {
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: `${key.replace(this.uploadedFolder, this.parsedFolder)}`
          };
          this.s3.copyObject(copyParams, (error, data) => {
            if (error) {
              console.log('Failed to copy record with an error: ', error);
              throw error;
            }
            console.log('Copied record: ', JSON.stringify(data));
          });
          const deleteParams = {
            Bucket: bucket,
            Key: key
          };
          this.s3.deleteObject(deleteParams, (error, data) => {
            if (error) {
              console.log('Failed to delete the record with an error: ', error);
              throw error;
            }
            console.log('Deleted record: ', JSON.stringify(data));
          });
        } catch (error) {
          console.log('Stream failed with an error: ', error);
          throw error;
        }
      });
  }
}
