import * as crypto from "crypto";
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import axios from "axios";
import addSeconds from "date-fns/addSeconds";
import subSeconds from "date-fns/subSeconds";
import isBefore from "date-fns/isBefore";
import { DB_CLIENT } from "./db";
import { OAuthStrategy } from "./oauth-strategy";
import { OAUTH_DOMAIN, OAUTH_TABLE } from "./env";

// Trigger refresh this many seconds before the expiry of a token
const EXPIRY_LEEWAY = 60;

export interface ServiceConfig {
  service: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

export class OAuth2Strategy implements OAuthStrategy {
  private readonly redirectUri: string;
  constructor(private readonly config: ServiceConfig) {
    this.redirectUri = `https://${OAUTH_DOMAIN}/authorized?service=${this.config.service}`;
  }

  async startAuthorization(): Promise<string> {
    const state = crypto.randomBytes(8).toString("hex");
    await DB_CLIENT.send(
      new PutCommand({
        TableName: OAUTH_TABLE,
        Item: {
          service: this.config.service,
          state,
        },
      }),
    );
    return `${this.config.authUrl}?${new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      scope: this.config.scope,
      redirect_uri: this.redirectUri,
      state,
    })}`;
  }

  async handleAuthorized(query: unknown): Promise<void> {
    if (!this.isValidAuthorizedQuery(query)) {
      throw new Error("Invalid authorized query params");
    }
    const { code, state } = query;

    const { Item: item } = await DB_CLIENT.send(
      new GetCommand({
        TableName: OAUTH_TABLE,
        Key: {
          service: this.config.service,
        },
      }),
    );

    if (item.state !== state) {
      throw new Error("Mismatched state");
    }

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    } = (
      await axios.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>(this.config.tokenUrl, null, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`,
          ).toString("base64")}`,
        },
        params: {
          code,
          redirect_uri: this.redirectUri,
          grant_type: "authorization_code",
        },
      })
    ).data;

    const expiresAt = subSeconds(
      addSeconds(new Date(), expiresIn),
      EXPIRY_LEEWAY,
    ).toISOString();

    await DB_CLIENT.send(
      new PutCommand({
        TableName: OAUTH_TABLE,
        Item: {
          service: this.config.service,
          accessToken,
          refreshToken,
          expiresAt,
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
    if (!item) {
      throw new Error(`No token stored for service: ${this.config.clientId}`);
    }
    if (isBefore(new Date(), new Date(item.expiresAt))) {
      return item.accessToken;
    }

    // We need to refresh the token
    const { access_token: accessToken, expires_in: expiresIn } = (
      await axios.post<{
        access_token: string;
        expires_in: number;
      }>(this.config.tokenUrl, null, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`,
          ).toString("base64")}`,
        },
        params: {
          refresh_token: item.refreshToken,
          redirect_uri: this.redirectUri,
          grant_type: "refresh_token",
        },
      })
    ).data;

    const expiresAt = subSeconds(
      addSeconds(new Date(), expiresIn),
      EXPIRY_LEEWAY,
    ).toISOString();

    await DB_CLIENT.send(
      new UpdateCommand({
        TableName: OAUTH_TABLE,
        Key: {
          service: this.config.service,
        },
        UpdateExpression: "SET accessToken = :a, expiresAt = :e",
        ExpressionAttributeValues: {
          ":a": accessToken,
          ":e": expiresAt,
        },
      }),
    );

    return accessToken;
  }

  private isValidAuthorizedQuery(
    query: unknown,
  ): query is { code: string; state: string } {
    return typeof query === "object" && "code" in query && "state" in query;
  }
}
