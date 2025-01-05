import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  GH_TOKEN: str(),
  CACHE_TABLE: str({ default: "Api-CacheTableC1E6DF7E-115Y7NFB43ULK" }),
  FLICKR_API_KEY: str(),
  LASTFM_API_KEY: str(),
});
