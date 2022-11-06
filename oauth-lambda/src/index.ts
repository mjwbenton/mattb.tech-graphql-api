import * as dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";
import {
  startAuthorization,
  handleAuthorized,
} from "@mattb.tech/graphql-api-oauth-lib";

const app = fastify();

app.get("/", (_, reply) => reply.send({}));

app.get("/start", async (req, res) => {
  const service = (req.query as any).service;
  const redirectTo = await startAuthorization(service);
  res.redirect(redirectTo);
});

app.get("/authorized", async (req, res) => {
  const service = (req.query as any).service;
  handleAuthorized(service, req.query);
  res.send({});
});

export const handler = awsLambdaFastify(app);
