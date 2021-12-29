import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer, mergeSchemas } from "apollo-server-lambda";
import githubSchema from "./githubSchema";
import flickrSchema from "./flickrSchema";
import spotifySchema from "./spotifySchema";
import billioSchema from "./billioRemote";
import cache from "./cache";
import dataSources from "./dataSources";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const server = new ApolloServer({
  schema: mergeSchemas({
    schemas: [flickrSchema, githubSchema, spotifySchema, billioSchema],
  }),
  dataSources,
  cache,
  persistedQueries: {
    ttl: THIRTY_DAYS,
  },
});

export const handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: false,
  },
});
