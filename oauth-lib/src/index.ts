import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as crypto from "crypto";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { cleanEnv, str } from "envalid";
import axios from "axios";
import addSeconds from "date-fns/addSeconds";
import subSeconds from "date-fns/subSeconds";
import isBefore from "date-fns/isBefore";

const { OAUTH_TABLE, OAUTH_DOMAIN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } =
  cleanEnv(process.env, {
    OAUTH_TABLE: str({ default: "ApiOauth-OauthTable4948C33A-1U2AI1DV03DLQ" }),
    OAUTH_DOMAIN: str({ default: "oauth.api.mattb.tech" }),
    SPOTIFY_CLIENT_ID: str(),
    SPOTIFY_CLIENT_SECRET: str(),
  });
const DB_CLIENT = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const SPOTIFY_SERVICE = "spotify";
const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SCOPE = "user-library-read";
const SPOTIFY_REDIRECT_URI = `https://${OAUTH_DOMAIN}/authorized?service=spotify`;

// Trigger refresh this many seconds before the expiry of a token
const EXPIRY_LEEWAY = 60;

export async function startAuthorization(service: string): Promise<string> {
  assertServiceIsSpotify(service);

  const state = crypto.randomBytes(8).toString("hex");
  await DB_CLIENT.send(
    new PutCommand({
      TableName: OAUTH_TABLE,
      Item: {
        service: SPOTIFY_SERVICE,
        state,
      },
    })
  );
  return `${SPOTIFY_AUTH_URL}?${new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPE,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state,
  })}`;
}

export async function handleAuthorized(
  service: string,
  query: unknown
): Promise<void> {
  assertServiceIsSpotify(service);
  if (!isValidAuthorizedQuery(query)) {
    throw new Error("Invalid authorized query params");
  }
  const { code, state } = query;

  const { Item: item } = await DB_CLIENT.send(
    new GetCommand({
      TableName: OAUTH_TABLE,
      Key: {
        service: SPOTIFY_SERVICE,
      },
    })
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
    }>(SPOTIFY_TOKEN_URL, null, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      params: {
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
      },
    })
  ).data;

  const expiresAt = subSeconds(
    addSeconds(new Date(), expiresIn),
    EXPIRY_LEEWAY
  ).toISOString();

  await DB_CLIENT.send(
    new PutCommand({
      TableName: OAUTH_TABLE,
      Item: {
        service: SPOTIFY_SERVICE,
        accessToken,
        refreshToken,
        expiresAt,
      },
    })
  );
}

export async function getAccessToken(service: string) {
  const { Item: item } = await DB_CLIENT.send(
    new GetCommand({
      TableName: OAUTH_TABLE,
      Key: {
        service,
      },
    })
  );
  if (!item) {
    throw new Error(`No token stored for service: ${service}`);
  }
  if (isBefore(new Date(), new Date(item.expiresAt))) {
    return item.accessToken;
  }

  // We need to refresh the token
  const { access_token: accessToken, expires_in: expiresIn } = (
    await axios.post<{
      access_token: string;
      expires_in: number;
    }>(SPOTIFY_TOKEN_URL, null, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      params: {
        refresh_token: item.refreshToken,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        grant_type: "refresh_token",
      },
    })
  ).data;

  const expiresAt = subSeconds(
    addSeconds(new Date(), expiresIn),
    EXPIRY_LEEWAY
  ).toISOString();

  await DB_CLIENT.send(
    new UpdateCommand({
      TableName: OAUTH_TABLE,
      Key: {
        service: SPOTIFY_SERVICE,
      },
      UpdateExpression: "SET accessToken = :a, expiresAt = :e",
      ExpressionAttributeValues: {
        ":a": accessToken,
        ":e": expiresAt,
      },
    })
  );

  return accessToken;
}

function assertServiceIsSpotify(service: string) {
  if (service !== SPOTIFY_SERVICE) {
    throw new Error(`Service "${service}" not supported`);
  }
}

function isValidAuthorizedQuery(
  query: unknown
): query is { code: string; state: string } {
  return typeof query === "object" && "code" in query && "state" in query;
}
