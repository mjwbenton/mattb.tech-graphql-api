import * as dotenv from "dotenv";
import fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import crypto from "crypto";
import { cleanEnv, str } from "envalid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import axios from "axios";

dotenv.config();
const { DOMAIN, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, TABLE } = cleanEnv(
  process.env,
  {
    SPOTIFY_CLIENT_ID: str(),
    SPOTIFY_CLIENT_SECRET: str(),
    DOMAIN: str(),
    TABLE: str(),
  }
);

const REDIRECT_URI = `https://${DOMAIN}/authorized`;

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SERVICE = "spotify";
const SPOTIFY_SCOPE = "user-library-read";

const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const app = fastify();

app.get("/", (_, reply) => reply.send({}));

app.get("/start", async (req, res) => {
  assertServiceIsSpotify(req);

  const state = crypto.randomBytes(8).toString("hex");
  await dbClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        service: SPOTIFY_SERVICE,
        state,
      },
    })
  );
  res.redirect(
    `${SPOTIFY_AUTH_URL}?${new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPE,
      redirect_uri: buildRedirectUri(SPOTIFY_SERVICE),
      state,
    })}`
  );
});

app.get("/authorized", async (req, res) => {
  assertServiceIsSpotify(req);

  const query = req.query as any;
  const { code, state } = query;

  const { Item: item } = await dbClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        service: SPOTIFY_SERVICE,
      },
    })
  );

  if (item.state !== state) {
    throw new Error("Mismatched state");
  }

  const response = await axios({
    url: SPOTIFY_TOKEN_URL,
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    params: {
      code,
      redirect_uri: buildRedirectUri("spotify"),
      grant_type: "authorization_code",
    },
  });

  await dbClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        service: SPOTIFY_SERVICE,
        ...response.data,
      },
    })
  );

  res.send({});
});

function buildRedirectUri(service: string): string {
  return `${REDIRECT_URI}?service=${service}`;
}

function assertServiceIsSpotify(req: { query: any }): void {
  if (req.query.service !== SPOTIFY_SERVICE) {
    throw new Error(`Service "${req.query.service}" not supported`);
  }
}

export const handler = awsLambdaFastify(app);
