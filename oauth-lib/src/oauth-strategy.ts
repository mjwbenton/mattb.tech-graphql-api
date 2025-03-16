export interface OAuthStrategy {
  startAuthorization(): Promise<string>;
  handleAuthorized(query: unknown): Promise<void>;
  getAccessToken(): Promise<string>;
}
