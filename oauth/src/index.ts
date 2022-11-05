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

dotenv.config();
const { DOMAIN, SPOTIFY_CLIENT_ID, TABLE } = cleanEnv(process.env, {
  SPOTIFY_CLIENT_ID: str(),
  DOMAIN: str(),
  TABLE: str(),
});

const REDIRECT_URI = `https://${DOMAIN}/authorized`;

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_SERVICE = "spotify";
const SPOTIFY_SCOPE = "user-read-private user-read-email";

const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const app = fastify();

app.get("/", (_, reply) => reply.send({}));

app.get("/start", async (req, res) => {
  const query = req.query as any;
  const service = query.service;
  assertServiceIsSpotify(service);

  const state = crypto.randomBytes(8).toString("hex");

  await dbClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        service,
        state,
      },
    })
  );

  res.redirect(
    `${SPOTIFY_AUTH_URL}?${new URLSearchParams({
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: SPOTIFY_SCOPE,
      redirect_uri: `${REDIRECT_URI}?service=${service}`,
      state,
    })}`
  );
});

app.get("/authorized", async (req, res) => {
  const query = req.query as any;
  const { code, state, service } = query;
  assertServiceIsSpotify(service);

  if (service !== SPOTIFY_SERVICE) {
    throw new Error();
  }

  const { Item: item } = await dbClient.send(
    new GetCommand({
      TableName: TABLE,
      Key: {
        service,
      },
    })
  );

  if (item.state !== state) {
    throw new Error("Mismatched state");
  }

  await dbClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        service,
        state,
        code,
      },
    })
  );

  res.send({});
});

function assertServiceIsSpotify(service: string): void {
  if (service !== SPOTIFY_SERVICE) {
    throw new Error(`Service "${service}" not supported`);
  }
}

export const handler = awsLambdaFastify(app);
