import { OAUTH_DOMAIN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./env";

export interface ServiceConfig {
  strategy: "oauth1" | "oauth2";
  service: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
}

export const serviceConfigs: Record<string, ServiceConfig> = {
  spotify: {
    service: "spotify",
    strategy: "oauth2",
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    scope: "user-library-read",
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    redirectUri: `https://${OAUTH_DOMAIN}/authorized?service=spotify`,
  },
};
