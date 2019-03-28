import * as dotenv from "dotenv";
dotenv.config();

import { ApolloServer, gql, mergeSchemas } from "apollo-server-lambda";
import githubSchema from "./githubSchema";
import flickrSchema from "./flickrSchema";
import goodreadsSchema from "./goodreadsSchema";
import { promisify } from "util";
import cache from "./cache";
import dataSources from "./dataSources";

let handler = null;

exports.handler = async (event, context, callback) => {
  if (handler == null) {
    const server = new ApolloServer({
      schema: mergeSchemas({
        schemas: await Promise.all([
          await flickrSchema(),
          await githubSchema(),
          await goodreadsSchema()
        ])
      }),
      dataSources,
      cache
    });
    console.log(`Server created ${JSON.stringify(server, null, 2)}`);

    handler = promisify(
      server.createHandler({
        cors: {
          origin: "*",
          credentials: false
        }
      })
    );
    console.log(`Handler created`);
  }

  try {
    const response = await handler(event, context);
    console.log(`Result ${JSON.stringify(response, null, 2)}`);
    callback(null, response);
  } catch (err) {
    console.error(`Error: ${JSON.stringify(err, null, 2)}`);
    callback(err, null);
  }
};
