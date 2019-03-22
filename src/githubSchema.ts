import {
  introspectSchema,
  makeRemoteExecutableSchema,
  transformSchema,
  FilterRootFields,
  gql,
  mergeSchemas
} from "apollo-server-lambda";
import { HttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import { setContext } from "apollo-link-context";

const { GITHUB_TOKEN } = process.env;

if (!GITHUB_TOKEN) {
  throw new Error("Missing github token");
}

const link = setContext((request, prevContext) => ({
  headers: {
    Authorization: `bearer ${GITHUB_TOKEN}`
  }
})).concat(
  new HttpLink({
    uri: "https://api.github.com/graphql",
    fetch
  })
);

const typeDefs = gql`
  type Query {
    github: RepositoryOwner
  }
`;

export default async () => {
  const githubSchema = makeRemoteExecutableSchema({
    schema: await introspectSchema(link),
    link
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
