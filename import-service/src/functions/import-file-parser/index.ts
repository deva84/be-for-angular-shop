import {handlerPath} from "@libs/handler-resolver";
import {config} from "dotenv";

config();

export default {
    handler: `${handlerPath(__dirname)}/import-file-parser.importFileParser`,
    events: [
        {
            s3: {
                bucket: 'import-and-parse-s3-bucket',
                event: 's3:ObjectCreated:*',
                rules: [{ prefix: 'uploaded/' }],
                existing: true,
            }
        }
    ]
};
