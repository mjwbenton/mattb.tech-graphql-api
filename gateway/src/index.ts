import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { ApolloGateway } from "@apollo/gateway";
import { readFileSync } from "fs";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const supergraphSdl = readFileSync("./supergraph.graphql").toString();

const gateway = new ApolloGateway({
  supergraphSdl,
});

const server = new ApolloServer({
  gateway,
  // TODO: Add cache
  persistedQueries: {
    ttl: THIRTY_DAYS,
  },
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
);
