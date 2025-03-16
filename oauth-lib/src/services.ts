import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./env";
import { OAuthStrategy } from "./oauth-strategy";
import { OAuth2Strategy } from "./oauth2";

export const services: Record<string, OAuthStrategy> = {
  spotify: new OAuth2Strategy({
    service: "spotify",
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    scope: "user-library-read",
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
  }),
};
