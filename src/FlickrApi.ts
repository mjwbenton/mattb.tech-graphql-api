import { DataSource, DataSourceConfig } from "apollo-datasource";
import { getRecentPhotos, getPhotoSet, getPhoto } from "@mattb.tech/flickr-api";
import { KeyValueCache } from "apollo-server-core";

const USER_ID = "83914470@N00";

export class FlickrDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;

  constructor(private apiKey: string) {
    super();
  }

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getRecentPhotos() {
    const cacheKey = `getRecentPhotos`;
    return this.doAndCache(cacheKey, () =>
      getRecentPhotos(this.apiKey, USER_ID)
    );
  }

  public async getPhoto(photoId: string) {
    const cacheKey = `getPhoto-${photoId}`;
    return this.doAndCache(cacheKey, () => getPhoto(this.apiKey, photoId));
  }

  public async getPhotoSet(photosetId: string) {
    const cacheKey = `getPhotoSet-${photosetId}`;
    return this.doAndCache(cacheKey, () =>
      getPhotoSet(this.apiKey, photosetId)
    );
  }

  private async doAndCache<T>(
    cacheKey: string,
    method: () => Promise<T>
  ): Promise<T> {
    const cacheResult = await this.cache.get(cacheKey);
    if (cacheResult) {
      console.log(`Cache hit on ${cacheKey}`);
      return JSON.parse(cacheResult) as T;
    }
    console.log(`Cache miss on ${cacheKey}`);
    const realResult = await method();
    this.cache.set(cacheKey, JSON.stringify(realResult));
    return realResult;
  }
}
