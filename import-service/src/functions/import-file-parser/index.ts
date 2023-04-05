import {handlerPath} from "@libs/handler-resolver";
import {config} from "dotenv";

config();

export default {
    handler: `${handlerPath(__dirname)}/import-file-parser.importFileParser`,
    events: [{ s3: 'importsBucket' }],
};
