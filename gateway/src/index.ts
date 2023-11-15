import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { ApolloGateway } from "@apollo/gateway";
import { readFileSync } from "fs";
import cache from "./cache";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const supergraphSdl = readFileSync("./supergraph.graphql").toString();

const gateway = new ApolloGateway({
  supergraphSdl,
});

const server = new ApolloServer({
  gateway,
  persistedQueries: {
    ttl: THIRTY_DAYS,
  },
  cache,
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
);
