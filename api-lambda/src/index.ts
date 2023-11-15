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
import cache from "./cache";
import ecologiSchema from "./ecologiSchema";
import testSchema from "./testSchema";
import dataSources from "./dataSources";
import { combineModules } from "./GqlModule";
import { buildSubgraphSchema } from "@apollo/subgraph";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const server = new ApolloServer({
  schema: buildSubgraphSchema(
    combineModules(
      flickrSchema,
      githubSchema,
      spotifySchema,
      ecologiSchema,
      testSchema,
    ),
  ),
  cache,
  persistedQueries: {
    ttl: THIRTY_DAYS,
  },
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
  {
    context: async () => ({
      dataSources: dataSources(server.cache),
    }),
  },
);
