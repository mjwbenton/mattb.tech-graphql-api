import * as crypto from "crypto";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import axios from "axios";
import { DB_CLIENT } from "./db";
import { OAuthStrategy } from "./oauth-strategy";
import { OAUTH_DOMAIN, OAUTH_TABLE } from "./env";

export interface OAuth1Config {
  service: string;
  apiKey: string;
  apiSecret: string;
  requestTokenUrl: string;
  accessTokenUrl: string;
  authorizeUrl: string;
}

export class OAuth1Strategy implements OAuthStrategy {
  private readonly redirectUri: string;

  constructor(private readonly config: OAuth1Config) {
    this.redirectUri = `https://${OAUTH_DOMAIN}/authorized?service=${this.config.service}`;
  }

  async startAuthorization(): Promise<string> {
    // Step 1: Get request token
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(8).toString("hex");

    const requestTokenParams = {
      oauth_callback: this.redirectUri,
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
    };

    const signature = this.generateSignature(
      this.config.requestTokenUrl,
      "POST",
      requestTokenParams,
    );

    const response = await axios.post(this.config.requestTokenUrl, null, {
      headers: {
        Authorization: this.generateAuthorizationHeader({
          ...requestTokenParams,
          oauth_signature: signature,
        }),
      },
    });

    const requestToken = this.parseOAuthResponse(response.data);

    // Store request token for later use
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
    return `${this.config.authorizeUrl}?oauth_token=${requestToken.oauth_token}`;
  }

  async handleAuthorized(query: unknown): Promise<void> {
    if (!this.isValidAuthorizedQuery(query)) {
      throw new Error("Invalid authorized query params");
    }

    const { oauth_token, oauth_verifier } = query;

    // Get stored request token
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
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(8).toString("hex");

    const accessTokenParams = {
      oauth_token,
      oauth_verifier,
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
    };

    const signature = this.generateSignature(
      this.config.accessTokenUrl,
      "POST",
      accessTokenParams,
      item.requestTokenSecret,
    );

    const response = await axios.post(this.config.accessTokenUrl, null, {
      headers: {
        Authorization: this.generateAuthorizationHeader({
          ...accessTokenParams,
          oauth_signature: signature,
        }),
      },
    });

    const accessToken = this.parseOAuthResponse(response.data);

    // Store access token
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

  private generateSignature(
    url: string,
    method: string,
    params: Record<string, string>,
    tokenSecret?: string,
  ): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map(
        (key) =>
          `${this.percentEncode(key)}=${this.percentEncode(params[key])}`,
      )
      .join("&");

    // Create signature base string
    const signatureBase = [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams),
    ].join("&");

    // Create signing key
    const signingKey = [
      this.percentEncode(this.config.apiSecret),
      tokenSecret ? this.percentEncode(tokenSecret) : "",
    ].join("&");

    // Generate HMAC-SHA1 signature
    const hmac = crypto.createHmac("sha1", signingKey);
    hmac.update(signatureBase);
    return hmac.digest("base64");
  }

  private generateAuthorizationHeader(params: Record<string, string>): string {
    const header = Object.keys(params)
      .filter((key) => key.startsWith("oauth_"))
      .sort()
      .map(
        (key) =>
          `${this.percentEncode(key)}="${this.percentEncode(params[key])}"`,
      )
      .join(", ");

    return `OAuth ${header}`;
  }

  private parseOAuthResponse(response: string): Record<string, string> {
    return Object.fromEntries(
      response.split("&").map((pair) => {
        const [key, value] = pair.split("=");
        return [key, decodeURIComponent(value)];
      }),
    );
  }

  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/\*/g, "%2A")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/%20/g, "+");
  }
}
