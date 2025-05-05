import doAndCache from "./doAndCache";
import axios from "axios";
import { Photo, PhotoSource, PhotoTag } from "./generated/graphql";
import env from "./env";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import { CAMERA, FILM, FORMAT, LENS, OTHER } from "./photoTags";
import { getAccessToken, oauth1Utils } from "@mattb.tech/graphql-api-oauth-lib";

const USER_AGENT = "mattb.tech/1.0";
const MAIN_USER_ID = "83914470@N00";
const USERS = [
  MAIN_USER_ID,
  "193257165@N05",
  "15016495@N00", // "nialloswald"
  "54232610@N08", // "alicethewhale"
  "22998020@N06", //"shlyn401"
  "195604247@N08", // "tammytrashbags"
];

const FLICKR_URL_BASE = "https://www.flickr.com/photos/";
const FLICKR_API_BASE_URL = "https://api.flickr.com/services/rest/";
const FLICKR_BASE_PARAMETERS = {
  format: "json",
  nojsoncallback: "1",
};

const WANTED_IMAGE_SIZES = new Set([
  "Medium",
  "Medium 640",
  "Medium 800",
  "Large",
  "Large 1600",
  "Large 2048",
]);

const ACCESS_TOKEN = getAccessToken("flickr");

type PhotoPage = {
  total: number;
  photos: Photo[];
};

export class FlickrDataSource {
  constructor(private readonly cache: KeyValueCache) {}

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
        extras: "url_z, url_c, url_l, url_k, tags, description",
      });
      if (!photosResponse.photoset) {
        return null;
      }
      const owner = photosResponse.photoset.owner;
      if (!USERS.includes(owner)) {
        throw new Error(`Cannot return photo set not owned by supported user`);
      }
      const photos: Photo[] = photosResponse.photoset.photo.map((p: any) => {
        const tags = p.tags.split(" ");
        return {
          id: p.id,
          pageUrl: `${FLICKR_URL_BASE}${owner}/${p.id}/`,
          title: p.title,
          mainSource: {
            url: p.url_c,
            height: p.height_c,
            width: p.width_c,
          },
          sources: buildRecentSources(p),
          camera: findCamera(tags),
          lens: findLens(tags),
          film: findFilm(tags),
          format: findFormat(tags),
          otherTags: findOtherTags(tags),
          description: p.description._content,
        };
      });
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
        extras: "url_z, url_c, url_l, url_k, tags, description",
        sort: "date-posted-desc",
        per_page: perPage,
        page,
      });
      const photos = response.photos.photo.map((p: any) => {
        const tags = p.tags.split(" ");
        return {
          id: p.id,
          pageUrl: `${FLICKR_URL_BASE}${p.owner}/${p.id}/`,
          title: p.title,
          mainSource: {
            url: p.url_c,
            height: p.height_c,
            width: p.width_c,
          },
          sources: buildRecentSources(p),
          camera: findCamera(tags),
          lens: findLens(tags),
          film: findFilm(tags),
          format: findFormat(tags),
          otherTags: findOtherTags(tags),
          description: p.description._content,
        };
      });
      return {
        total: response.photos.total,
        photos,
      };
    });
  }

  public async getPhotos({
    perPage,
    page = 1,
    startDate,
    endDate,
  }: {
    perPage: number;
    page?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PhotoPage> {
    const cacheKey = `getPhotos-${startDate?.toISOString() ?? "x"}${endDate?.toISOString() ?? "x"}${perPage}p${page}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await callFlickr("flickr.photos.search", {
        user_id: MAIN_USER_ID,
        ...(startDate ? { min_upload_date: startDate.getTime() / 1000 } : {}),
        ...(endDate ? { max_upload_date: endDate.getTime() / 1000 } : {}),
        extras: "url_z, url_c, url_l, url_k, tags, description",
        per_page: perPage,
        page,
      });
      const photos = response.photos.photo.map((p: any) => {
        const tags = p.tags.split(" ");
        return {
          id: p.id,
          pageUrl: `${FLICKR_URL_BASE}${p.owner}/${p.id}/`,
          title: p.title,
          mainSource: {
            url: p.url_c,
            height: p.height_c,
            width: p.width_c,
          },
          sources: buildRecentSources(p),
          camera: findCamera(tags),
          lens: findLens(tags),
          film: findFilm(tags),
          format: findFormat(tags),
          otherTags: findOtherTags(tags),
          description: p.description._content,
        };
      });
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
        extras: "url_z,%20url_c,%20url_l,%20url_k,%20tags,%20description",
        per_page: perPage,
        page,
      });
      const photos = response.photos.photo.map((p: any) => {
        const tags = p.tags.split(" ");
        return {
          id: p.id,
          pageUrl: `${FLICKR_URL_BASE}${p.owner}/${p.id}/`,
          title: p.title,
          mainSource: {
            url: p.url_c,
            height: p.height_c,
            width: p.width_c,
          },
          sources: buildRecentSources(p),
          camera: findCamera(tags),
          lens: findLens(tags),
          film: findFilm(tags),
          format: findFormat(tags),
          otherTags: findOtherTags(tags),
          description: p.description._content,
        };
      });
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
      console.log(infoResponse.photo.owner.nsid);
      if (!USERS.includes(infoResponse.photo.owner.nsid)) {
        throw new Error(`Cannot return photo not owned by supported user`);
      }
      const tags = infoResponse.photo.tags.tag.map(({ _content }) => _content);
      return {
        id: photoId,
        title: infoResponse.photo.title._content,
        description: infoResponse.photo.description._content,
        pageUrl: infoResponse.photo.urls.url.filter(
          (url: any) => url.type === "photopage",
        )[0]._content,
        sources,
        mainSource,
        camera: findCamera(tags),
        lens: findLens(tags),
        film: findFilm(tags),
        format: findFormat(tags),
        otherTags: findOtherTags(tags),
      };
    });
  }
}

async function callFlickr(
  methodName: string,
  params: { [key: string]: string | number },
  retryNumber: number = 0,
): Promise<any> {
  const oauthParams = {
    ...oauth1Utils.createOauthBaseParams(),
    oauth_consumer_key: env.FLICKR_API_KEY,
    oauth_token: await ACCESS_TOKEN,
  };

  const allParams = {
    ...oauthParams,
    ...FLICKR_BASE_PARAMETERS,
    method: methodName,
    ...params,
  };

  const signature = oauth1Utils.generateSignature({
    signingKey: oauth1Utils.createSigningKey(env.FLICKR_API_SECRET),
    url: FLICKR_API_BASE_URL + "services/rest/",
    params: allParams as Record<string, string>,
  });

  const authHeader = oauth1Utils.generateAuthorizationHeader({
    ...oauthParams,
    oauth_signature: signature,
  });

  const queryString = Object.entries(allParams)
    .filter(([key]) => !key.startsWith("oauth_"))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const url = `${FLICKR_API_BASE_URL}services/rest/?${queryString}`;
  console.log("Flickr URL", url);

  try {
    const result = await axios.get(url, {
      headers: {
        Authorization: authHeader,
        "User-Agent": USER_AGENT,
      },
    });
    console.log("Flickr result", result.data);
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

function findCamera(tags: string[]): PhotoTag | undefined {
  const camera = tags.find((tag) => tag in CAMERA);
  if (!camera) {
    return undefined;
  }
  const { name } = CAMERA[camera];
  return {
    tag: camera,
    name,
  };
}

function findFormat(tags: string[]): PhotoTag | undefined {
  const camera = tags.find((tag) => tag in CAMERA);
  if (!camera) {
    return undefined;
  }
  const { format } = CAMERA[camera];
  const { name } = FORMAT[format];
  return {
    tag: format,
    name,
  };
}

function findLens(tags: string[]): PhotoTag | undefined {
  const lens = tags.find((tag) => tag in LENS);
  if (!lens) {
    return undefined;
  }
  const { name } = LENS[lens];
  return {
    tag: lens,
    name,
  };
}

function findFilm(tags: string[]): PhotoTag | undefined {
  const film = tags.find((tag) => tag in FILM);
  if (!film) {
    return undefined;
  }
  const { name } = FILM[film];
  return {
    tag: film,
    name,
  };
}

function findOtherTags(tags: string[]): PhotoTag[] {
  return tags
    .filter((tag) => tag in OTHER)
    .map((tag) => ({
      tag,
      name: OTHER[tag].name,
    }));
}
