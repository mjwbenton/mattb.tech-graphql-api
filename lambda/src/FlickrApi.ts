import { DataSource, DataSourceConfig } from "apollo-datasource";
import { getRecentPhotos, getPhotoSet, getPhoto } from "@mattb.tech/flickr-api";
import { KeyValueCache } from "apollo-server-core";
import doAndCache from "./doAndCache";

const USER_ID = "83914470@N00";

export class FlickrDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;
  private apiKey: string;

  constructor() {
    super();
    this.apiKey = process.env.FLICKR_API_KEY;
    if (!this.apiKey) {
      throw new Error("Missing flickr API key");
    }
  }

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getRecentPhotos() {
    const cacheKey = `getRecentPhotos`;
    return doAndCache(this.cache, cacheKey, () =>
      getRecentPhotos(this.apiKey, USER_ID)
    );
  }

  public async getPhoto(photoId: string) {
    const cacheKey = `getPhoto-${photoId}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const photo = await getPhoto(this.apiKey, photoId);
      if (photo.userId !== USER_ID) {
        throw new Error(`Cannot return photo not owned by ${USER_ID}`);
      }
      return photo;
    });
  }

  public async getPhotoSet(photosetId: string) {
    const cacheKey = `getPhotoSet-${photosetId}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const photoSet = await getPhotoSet(this.apiKey, photosetId);
      if (photoSet.length > 0 && photoSet[0].userId !== USER_ID) {
        throw new Error(`Cannot return photo set not owned by ${USER_ID}`);
      }
      return photoSet;
    });
  }
}
