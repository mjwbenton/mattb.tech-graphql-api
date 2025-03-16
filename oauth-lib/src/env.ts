import { cleanEnv, str } from "envalid";

export const {
  OAUTH_TABLE,
  OAUTH_DOMAIN,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = cleanEnv(process.env, {
  OAUTH_TABLE: str({ default: "ApiOauth-OauthTable4948C33A-1U2AI1DV03DLQ" }),
  OAUTH_DOMAIN: str({ default: "oauth.api.mattb.tech" }),
  SPOTIFY_CLIENT_ID: str(),
  SPOTIFY_CLIENT_SECRET: str(),
});
