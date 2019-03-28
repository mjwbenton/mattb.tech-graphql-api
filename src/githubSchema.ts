import {
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  FilterRootFields,
  gql,
  mergeSchemas
} from "apollo-server-lambda";
import fetch from "node-fetch";
import { print } from "graphql";
import cache from "./cache";
import doAndCache from "./doAndCache";

const { GITHUB_TOKEN } = process.env;

if (!GITHUB_TOKEN) {
  throw new Error("Missing github token");
}

const fetcher = async ({ query: queryDocument, variables, operationName }) => {
  const query = print(queryDocument);
  const fetchResult = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables, operationName })
  });
  return fetchResult.json();
};

const typeDefs = gql`
  type Query {
    github: RepositoryOwner
  }
`;

export default async () => {
  const githubSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(fetcher),
    fetcher
  });

  const filteredSchema = transformSchema(githubSchema, [
    new FilterRootFields(() => false)
  ]);

  return mergeSchemas({
    schemas: [filteredSchema, typeDefs],
    resolvers: {
      Query: {
        github: (_: never, __: never, context: never, info: any) => {
          return info.mergeInfo.delegateToSchema({
            schema: githubSchema,
            operation: "query",
            fieldName: "repositoryOwner",
            args: {
              login: "mjwbenton"
            },
            context,
            info
          });
        }
      }
    }
  });
};
