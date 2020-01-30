import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBCache } from "apollo-server-cache-dynamodb";

export default new DynamoDBCache(new DynamoDB.DocumentClient(), {
  tableName: "apollo-cache-table",
  defaultTTL: 60 * 60
});
