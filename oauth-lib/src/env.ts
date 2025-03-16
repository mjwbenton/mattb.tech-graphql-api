import { cleanEnv, str } from "envalid";

export const {
  OAUTH_TABLE,
  OAUTH_DOMAIN,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  FLICKR_API_KEY,
  FLICKR_API_SECRET,
} = cleanEnv(process.env, {
  OAUTH_TABLE: str({ default: "ApiOauth-OauthTable4948C33A-1U2AI1DV03DLQ" }),
  OAUTH_DOMAIN: str({ default: "oauth.api.mattb.tech" }),
  SPOTIFY_CLIENT_ID: str(),
  SPOTIFY_CLIENT_SECRET: str(),
  FLICKR_API_KEY: str(),
  FLICKR_API_SECRET: str(),
});
