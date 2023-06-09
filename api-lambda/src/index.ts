import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import githubSchema from "./githubSchema";
import flickrSchema from "./flickrSchema";
import spotifySchema from "./spotifySchema";
import billioSchema from "./billioRemote";
import cache from "./cache";
import ecologiSchema from "./ecologiSchema";
import testSchema from "./testSchema";
import healthioSchema from "./healthioRemote";
import { mergeSchemas } from "@graphql-tools/schema";
import dataSources from "./dataSources";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const server = new ApolloServer({
  schema: mergeSchemas({
    schemas: [
      flickrSchema,
      githubSchema,
      spotifySchema,
      billioSchema,
      ecologiSchema,
      testSchema,
      healthioSchema,
    ],
  }),
  cache,
  persistedQueries: {
    ttl: THIRTY_DAYS,
  },
});

// TODO: CORS?
export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
  {
    context: async () => ({
      dataSources: dataSources(server.cache),
    }),
  }
);
