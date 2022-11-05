import * as dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import awsLambdaFastify from "@fastify/aws-lambda";

const app = fastify();
app.get("/", (_, reply) =>
  reply.send({ hello: process.env.SPOTIFY_CLIENT_ID })
);

export const handler = awsLambdaFastify(app);
