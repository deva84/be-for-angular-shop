import {s3Client} from "../common/client";
import {CopyObjectCommand, DeleteObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import {config} from 'dotenv';
import {SQS} from 'aws-sdk';

config();
export class ImportServiceMiddleware {
  private uploadedFolder = 'uploaded';
  private parsedFolder = 'parsed';
  private sqs = new SQS();

  async handleFileImport(records): Promise<any> {
    try {
      for (const record of records) {
        await this.saveRecord(record);
        await this.moveParsedRecord(record);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async moveParsedRecord(record) {
    await this.copyFile(record);
    await this.deleteFile(record);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    });
    await s3Client.send(deleteCommand);
  }

  async copyFile(record) {
    const moveCommand = new CopyObjectCommand({
        Bucket: record.s3.bucket.name,
        CopySource: `${record.s3.bucket.name}/${record.s3.object.key}`,
        Key: record.s3.object.key.replace(this.uploadedFolder, this.parsedFolder),
      });
      return await s3Client.send(moveCommand);
  }

  async deleteFile(record) {
    const commandParameters = {
      Bucket: 'import-and-parse-s3-bucket',
      Key: record.s3.object.key,
    };
    const command = new DeleteObjectCommand(commandParameters);
    return await s3Client.send(command);
  };

  async saveRecord(record) {
    console.log('processing file:', record.s3.object.key);
    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'import-and-parse-s3-bucket',
        Key: record.s3.object.key,
      });
      const stream = await s3Client.send(getCommand);
      await this.readStream(stream.Body);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  readStream(stream: any): Promise<any> {
    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', async (item) => {
          try {
            await this.sqs.sendMessage({
              QueueUrl: process.env.SQS_URL,
              MessageBody: JSON.stringify(item)
            }).promise();

            console.log('Sent to qeueu: ', item);
                
          } catch(error) {
            console.log('Failed to send next item to queue with an error: ', item, error);
          }    
        })
        .on('end', () => {
          console.log('Queue is complete');
          resolve(null);
        })
        .on('error', (error) => {
          console.log(error)
          reject(error);
        });
    });
  };
}