import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const DB_CLIENT = DynamoDBDocumentClient.from(new DynamoDBClient({}));
