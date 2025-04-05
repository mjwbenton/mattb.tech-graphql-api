import * as crypto from "crypto";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import axios from "axios";
import { DB_CLIENT } from "./db";
import { OAuthStrategy } from "./oauth-strategy";
import { OAUTH_DOMAIN, OAUTH_TABLE } from "./env";
import oauth1Utils from "./oauth1Utils";

export interface OAuth1Config {
  service: string;
  apiKey: string;
  apiSecret: string;
  requestTokenUrl: string;
  accessTokenUrl: string;
  authorizeUrl: string;
}

// Flickr requires a User-Agent header
const USER_AGENT = "mattb.tech-oauth-lib/1.0";

export class OAuth1Strategy implements OAuthStrategy {
  private readonly redirectUri: string;

  constructor(private readonly config: OAuth1Config) {
    this.redirectUri = `https://${OAUTH_DOMAIN}/authorized?service=${this.config.service}`;
  }

  async startAuthorization(): Promise<string> {
    // Step 1: Get request token

    const requestTokenParams = {
      oauth_callback: this.redirectUri,
      oauth_consumer_key: this.config.apiKey,
      ...oauth1Utils.createOauthBaseParams(),
    };

    const signature = oauth1Utils.generateSignature({
      signingKey: oauth1Utils.createSigningKey(this.config.apiSecret),
      url: this.config.requestTokenUrl,
      params: requestTokenParams,
    });

    const response = await axios.post(this.config.requestTokenUrl, null, {
      headers: {
        Authorization: oauth1Utils.generateAuthorizationHeader({
          ...requestTokenParams,
          oauth_signature: signature,
        }),
        "User-Agent": USER_AGENT,
      },
    });

    const requestToken = this.parseOAuthResponse(response.data);

    await DB_CLIENT.send(
      new PutCommand({
        TableName: OAUTH_TABLE,
        Item: {
          service: this.config.service,
          requestToken: requestToken.oauth_token,
          requestTokenSecret: requestToken.oauth_token_secret,
        },
      }),
    );

    // Step 2: Redirect to authorization URL
    // Flickr requires a perms parameter
    return `${this.config.authorizeUrl}?oauth_token=${requestToken.oauth_token}&perms=read`;
  }

  async handleAuthorized(query: unknown): Promise<void> {
    if (!this.isValidAuthorizedQuery(query)) {
      throw new Error("Invalid authorized query params");
    }

    const { oauth_token, oauth_verifier } = query;

    const { Item: item } = await DB_CLIENT.send(
      new GetCommand({
        TableName: OAUTH_TABLE,
        Key: {
          service: this.config.service,
        },
      }),
    );

    if (!item?.requestToken || item.requestToken !== oauth_token) {
      throw new Error("Invalid or expired request token");
    }

    // Step 3: Exchange request token for access token

    const accessTokenParams = {
      oauth_token,
      oauth_verifier,
      oauth_consumer_key: this.config.apiKey,
      ...oauth1Utils.createOauthBaseParams(),
    };

    const signature = oauth1Utils.generateSignature({
      signingKey: oauth1Utils.createSigningKey(
        this.config.apiSecret,
        item.requestTokenSecret,
      ),
      url: this.config.accessTokenUrl,
      params: accessTokenParams,
    });

    const response = await axios.post(this.config.accessTokenUrl, null, {
      headers: {
        Authorization: oauth1Utils.generateAuthorizationHeader({
          ...accessTokenParams,
          oauth_signature: signature,
        }),
        "User-Agent": USER_AGENT,
      },
    });

    const accessToken = this.parseOAuthResponse(response.data);

    await DB_CLIENT.send(
      new PutCommand({
        TableName: OAUTH_TABLE,
        Item: {
          service: this.config.service,
          accessToken: accessToken.oauth_token,
          accessTokenSecret: accessToken.oauth_token_secret,
        },
      }),
    );
  }

  async getAccessToken(): Promise<string> {
    const { Item: item } = await DB_CLIENT.send(
      new GetCommand({
        TableName: OAUTH_TABLE,
        Key: {
          service: this.config.service,
        },
      }),
    );

    if (!item?.accessToken) {
      throw new Error(
        `No access token stored for service: ${this.config.service}`,
      );
    }

    return item.accessToken;
  }

  private isValidAuthorizedQuery(
    query: unknown,
  ): query is { oauth_token: string; oauth_verifier: string } {
    return (
      typeof query === "object" &&
      "oauth_token" in query &&
      "oauth_verifier" in query
    );
  }

  private parseOAuthResponse(response: string): Record<string, string> {
    return Object.fromEntries(
      response.split("&").map((pair) => {
        const [key, value] = pair.split("=");
        return [key, decodeURIComponent(value)];
      }),
    );
  }
}
