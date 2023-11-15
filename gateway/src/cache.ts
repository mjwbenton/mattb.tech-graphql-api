import env from "./env";

import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const CLIENT = DynamoDBDocument.from(new DynamoDB({}));

const TABLE_NAME = env.CACHE_TABLE;
const PARTITION_KEY = "CacheKey";
const VALUE_ATTRIBUTE = "CacheValue";
const TTL_ATTRIBUTE = "CacheTTL";
const DEFAULT_TTL = 60 * 60;

const cache: KeyValueCache = {
  get(key: string): Promise<string> {
    const params = {
      Key: {
        [PARTITION_KEY]: key,
      },
      TableName: TABLE_NAME,
    };
    return CLIENT.get(params).then(({ Item = {} }) => {
      // since DynamoDB itself doesnt really clean up items with TTL in a reliable, timely fashion
      // we need to manually check if the cached value should still be alive
      if (
        !Item[TTL_ATTRIBUTE] ||
        Item[TTL_ATTRIBUTE] >= Math.floor(Date.now() / 1000)
      ) {
        return Item[VALUE_ATTRIBUTE];
      }
      return undefined;
    });
  },

  set(key: string, value: string, options?: { ttl?: number }): Promise<void> {
    const epochSeconds = calculateTTL(options);
    if (epochSeconds === undefined) {
      return new Promise((resolve) => resolve());
    }
    const params = {
      Item: {
        [PARTITION_KEY]: key,
        [VALUE_ATTRIBUTE]: value,
        [TTL_ATTRIBUTE]: epochSeconds,
      },
      TableName: TABLE_NAME,
    };

    return CLIENT.put(params).then(() => {});
  },

  delete(key: string): Promise<boolean | void> {
    const params = {
      Key: {
        [PARTITION_KEY]: key,
      },
      TableName: TABLE_NAME,
    };
    return CLIENT.delete(params).then(() => {});
  },
};

export default cache;

function calculateTTL(options: { ttl?: number } = {}) {
  const { ttl = DEFAULT_TTL } = options;
  if (ttl <= 0) {
    return undefined;
  }
  const epochSeconds = Math.floor(Date.now() / 1000) + ttl;
  return epochSeconds;
}
