import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import doAndCache from "./doAndCache";
import axios from "axios";
import { Photo, PhotoSource } from "./generated/graphql";

const USER_ID = "83914470@N00";

const FLICKR_URL_BASE = "https://www.flickr.com/photos/";
const FLICKR_API_BASE_URL = "https://api.flickr.com/services/rest/";
const FLICKR_BASE_PARAMETERS = "?format=json&nojsoncallback=1";

const WANTED_IMAGE_SIZES = new Set([
  "Medium",
  "Medium 640",
  "Medium 800",
  "Large",
  "Large 1600",
  "Large 2048",
]);

const API_KEY = process.env.FLICKR_API_KEY;

async function callFlickr(
  methodName: string,
  params: { [key: string]: string },
  retryNumber: number = 0
): Promise<any> {
  let url =
    FLICKR_API_BASE_URL + FLICKR_BASE_PARAMETERS + `&api_key=${API_KEY}&`;
  let paramsStr = `method=${methodName}`;
  Object.keys(params).forEach((key) => {
    const value = params[key];
    paramsStr += `&${key}=${value}`;
  });
  url += paramsStr;
  try {
    const result = await axios.get(url);
    return result.data;
  } catch (err) {
    if (retryNumber < 2) {
      return callFlickr(methodName, params, retryNumber + 1);
    }
    console.error(`Error calling flickr url: ${url}\n${err}`);
    throw err;
  }
}

function buildSizesSources(sizesResponse: any): PhotoSource[] {
  return sizesResponse.sizes.size
    .filter((el: any) => WANTED_IMAGE_SIZES.has(el.label))
    .map((el: any) => ({
      url: el.source,
      width: parseInt(el.width),
      height: parseInt(el.height),
    }))
    .sort((a: PhotoSource, b: PhotoSource) => b.width - a.width);
}

function buildRecentSources(photoResponse: any): PhotoSource[] {
  const result: PhotoSource[] = [];
  Object.keys(photoResponse).forEach((key) => {
    if (key.startsWith("url_")) {
      const sizeKey = key.replace("url_", "");
      result.push({
        url: photoResponse[key],
        height: photoResponse[`height_${sizeKey}`],
        width: photoResponse[`width_${sizeKey}`],
      });
    }
  });
  return result;
}

export class FlickrDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getPhotoSet(setId: string): Promise<Photo[]> {
    const cacheKey = `getPhotoSet-${setId}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const photosResponse = await callFlickr("flickr.photosets.getPhotos", {
        photoset_id: setId,
      });
      const owner = photosResponse.photoset.owner;
      if (owner !== USER_ID) {
        throw new Error(`Cannot return photo set not owned by ${USER_ID}`);
      }
      const promises: Promise<Photo>[] = photosResponse.photoset.photo.map(
        async (p: any) => {
          const sizes = await callFlickr("flickr.photos.getSizes", {
            photo_id: p.id,
          });
          const photoSources = buildSizesSources(sizes);
          const mainSource = photoSources[photoSources.length - 1];
          return {
            id: p.id,
            title: p.title,
            pageUrl: `${FLICKR_URL_BASE}${USER_ID}/${p.id}/`,
            sources: photoSources,
            mainSource: mainSource,
          };
        }
      );
      return await Promise.all(promises);
    });
  }

  public async getPhotosWithTag(tag: string): Promise<Photo[]> {
    const cacheKey = `getPhotosWithTag-${tag}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.photos.search", {
        user_id: USER_ID,
        tags: tag,
        extras: "url_z, url_c, url_l, url_k",
        per_page: "50",
      });
      return response.photos.photo.map((p: any) => ({
        id: p.id,
        pageUrl: `${FLICKR_URL_BASE}${p.owner}/${p.id}/`,
        title: p.title,
        mainSource: {
          url: p.url_c,
          height: p.height_c,
          width: p.width_c,
        },
        sources: buildRecentSources(p),
      }));
    });
  }

  public async getRecentPhotos(): Promise<Photo[]> {
    const cacheKey = `getRecentPhotos`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.people.getPublicPhotos", {
        user_id: USER_ID,
        extras: "url_z, url_c, url_l, url_k",
        per_page: "50",
      });
      return response.photos.photo.map((p: any) => ({
        id: p.id,
        pageUrl: `${FLICKR_URL_BASE}${p.owner}/${p.id}/`,
        title: p.title,
        mainSource: {
          url: p.url_c,
          height: p.height_c,
          width: p.width_c,
        },
        sources: buildRecentSources(p),
      }));
    });
  }

  public async getPhoto(photoId: string): Promise<Photo> {
    const cacheKey = `getPhoto-${photoId}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const [infoResponse, sizesResponse] = await Promise.all([
        callFlickr("flickr.photos.getInfo", {
          photo_id: photoId,
        }),
        callFlickr("flickr.photos.getSizes", {
          photo_id: photoId,
        }),
      ]);
      const sources = buildSizesSources(sizesResponse);
      const mainSource = sources[sources.length - 1];
      if (infoResponse.photo.owner.nsid !== USER_ID) {
        throw new Error(`Cannot return photo not owned by ${USER_ID}`);
      }
      return {
        id: photoId,
        title: infoResponse.photo.title._content,
        pageUrl: infoResponse.photo.urls.url.filter(
          (url: any) => url.type === "photopage"
        )[0]._content,
        sources,
        mainSource,
      };
    });
  }
}
