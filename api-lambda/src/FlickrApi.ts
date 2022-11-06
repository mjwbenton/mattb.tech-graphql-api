import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import doAndCache from "./doAndCache";
import axios from "axios";
import { Photo, PhotoSource } from "./generated/graphql";
import env from "./env";

const MAIN_USER_ID = "83914470@N00";
const USERS = [MAIN_USER_ID, "193257165@N05"];

const API_KEY = env.FLICKR_API_KEY;
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

type PhotoPage = {
  total: number;
  photos: Photo[];
};

export class FlickrDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getPhotoSet({
    photosetId,
    perPage,
    page = 1,
  }: {
    photosetId: string;
    perPage: number;
    page?: number;
  }): Promise<PhotoPage | null> {
    const cacheKey = `getPhotoSet-${photosetId}-${perPage}p${page}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const photosResponse = await callFlickr("flickr.photosets.getPhotos", {
        photoset_id: photosetId,
        per_page: perPage,
        page: page,
      });
      if (!photosResponse.photoset) {
        return null;
      }
      const owner = photosResponse.photoset.owner;
      if (!USERS.includes(owner)) {
        throw new Error(`Cannot return photo set not owned by supported user`);
      }
      const photos: Photo[] = await Promise.all(
        photosResponse.photoset.photo.map(async (p: any) => {
          const sizes = await callFlickr("flickr.photos.getSizes", {
            photo_id: p.id,
          });
          const photoSources = buildSizesSources(sizes);
          const mainSource = photoSources[photoSources.length - 1];
          return {
            id: p.id,
            title: p.title,
            pageUrl: `${FLICKR_URL_BASE}${owner}/${p.id}/`,
            sources: photoSources,
            mainSource: mainSource,
          };
        })
      );
      return {
        photos,
        total: photosResponse.photoset.total,
      };
    });
  }

  public async getPhotosWithTag({
    tag,
    perPage,
    page = 1,
  }: {
    tag: string;
    perPage: number;
    page?: number;
  }): Promise<PhotoPage> {
    const cacheKey = `getPhotosWithTag-${tag}-${perPage}p${page}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.photos.search", {
        user_id: MAIN_USER_ID,
        tags: tag,
        extras: "url_z, url_c, url_l, url_k",
        sort: "date-posted-desc",
        per_page: perPage,
        page,
      });
      const photos = response.photos.photo.map((p: any) => ({
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
      return {
        total: response.photos.total,
        photos,
      };
    });
  }

  public async getRecentPhotos({
    perPage,
    page = 1,
  }: {
    perPage: number;
    page?: number;
  }): Promise<PhotoPage> {
    const cacheKey = `getRecentPhotos-${perPage}p${page}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.people.getPublicPhotos", {
        user_id: MAIN_USER_ID,
        extras: "url_z, url_c, url_l, url_k",
        per_page: perPage,
        page,
      });
      const photos = response.photos.photo.map((p: any) => ({
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
      return {
        total: response.photos.total,
        photos,
      };
    });
  }

  public async getPhoto(photoId: string): Promise<Photo | null> {
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
      if (!infoResponse.photo || !sizesResponse.sizes) {
        return null;
      }
      const sources = buildSizesSources(sizesResponse);
      const mainSource = sources[sources.length - 1];
      if (!USERS.includes(infoResponse.photo.owner.nsid)) {
        throw new Error(`Cannot return photo not owned by supported user`);
      }
      return {
        id: photoId,
        title: infoResponse.photo.title._content,
        description: infoResponse.photo.description._content,
        pageUrl: infoResponse.photo.urls.url.filter(
          (url: any) => url.type === "photopage"
        )[0]._content,
        sources,
        mainSource,
      };
    });
  }

  public async getDescription(photoId: string): Promise<string | null> {
    const cacheKey = `getDescription-${photoId}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.photos.getInfo", {
        photo_id: photoId,
      });
      if (!response) {
        return null;
      }
      if (!USERS.includes(response.photo.owner.nsid)) {
        throw new Error(`Cannot return photo not owned by supported user`);
      }
      return response?.photo?.description?._content ?? null;
    });
  }
}

async function callFlickr(
  methodName: string,
  params: { [key: string]: string | number },
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
