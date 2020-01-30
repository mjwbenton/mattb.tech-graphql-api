import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBCache } from "apollo-server-cache-dynamodb";

export default new DynamoDBCache(new DynamoDB.DocumentClient(), {
  tableName: process.env.CACHE_TABLE,
  defaultTTL: 60 * 60
});
