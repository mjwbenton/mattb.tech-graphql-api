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
import lastfmSchema from "./lastfmSchema";
import { Handler } from "aws-lambda";

const server = new ApolloServer({
  schema: buildSubgraphSchema(
    combineModules(
      flickrSchema,
      githubSchema,
      spotifySchema,
      ecologiSchema,
      lastfmSchema,
      testSchema,
    ),
  ),
  cache,
});

export const handler: Handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler(),
  {
    context: async () => ({
      dataSources: dataSources(server.cache),
    }),
  },
);
