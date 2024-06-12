import { KeyValueCache } from "@apollo/utils.keyvaluecache";

export default async function doAndCache<T>(
  cache: KeyValueCache,
  cacheKey: string,
  method: () => Promise<T>,
): Promise<T> {
  /*const cacheResult = await cache.get(cacheKey);
  if (cacheResult) {
    console.log(`Cache hit on ${cacheKey}`);
    return JSON.parse(cacheResult) as T;
  }
  console.log(`Cache miss on ${cacheKey}`);*/
  const realResult = await method();
  //cache.set(cacheKey, JSON.stringify(realResult));
  return realResult;
}
