import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBCache } from "apollo-server-cache-dynamodb";

export default new DynamoDBCache(new DynamoDB.DocumentClient(), {
  tableName: process.env.CACHE_TABLE || "Api-CacheTableC1E6DF7E-115Y7NFB43ULK",
  defaultTTL: 60 * 60,
});
