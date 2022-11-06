import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBCache } from "apollo-server-cache-dynamodb";
import env from "./env";

export default new DynamoDBCache(new DynamoDB.DocumentClient(), {
  tableName: env.CACHE_TABLE,
  defaultTTL: 60 * 60,
});
