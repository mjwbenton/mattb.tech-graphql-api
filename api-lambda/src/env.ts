import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  GH_TOKEN: str(),
  CACHE_TABLE: str({ default: "BaseApi-CacheTableC1E6DF7E-24EJFN72JRFS" }),
  FLICKR_API_KEY: str(),
  FLICKR_API_SECRET: str(),
  LASTFM_API_KEY: str(),
});
