import * as dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import crypto from "crypto";

const REDIRECT_URI = `https://${process.env.DOMAIN}/authorized`;

const app = fastify();
app.get("/", (_, reply) => reply.send({}));

app.get("/start", (_, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: "user-read-private user-read-email",
      redirect_uri: REDIRECT_URI,
      state: crypto.randomBytes(8).toString("hex"),
    })}`
  );
});

app.get("/authorized", (req, res) => {
  res.send({ query: req.query });
});

export const handler = awsLambdaFastify(app);
