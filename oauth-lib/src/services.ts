import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  FLICKR_API_KEY,
  FLICKR_API_SECRET,
} from "./env";
import { OAuthStrategy } from "./oauth-strategy";
import { OAuth2Strategy } from "./oauth2";
import { OAuth1Strategy } from "./oauth1";

export const services: Record<string, OAuthStrategy> = {
  spotify: new OAuth2Strategy({
    service: "spotify",
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    scope: "user-library-read",
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
  }),
  flickr: new OAuth1Strategy({
    service: "flickr",
    apiKey: FLICKR_API_KEY,
    apiSecret: FLICKR_API_SECRET,
    requestTokenUrl: "https://www.flickr.com/services/oauth/request_token",
    accessTokenUrl: "https://www.flickr.com/services/oauth/access_token",
    authorizeUrl: "https://www.flickr.com/services/oauth/authorize",
  }),
};
