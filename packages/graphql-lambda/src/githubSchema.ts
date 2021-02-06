import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    githubRepositories(limit: Int): [Repository]
  }

  type Repository {
    name: String!
    url: String!
    createdAt: String!
    updatedAt: String!
    description: String
    license: String
    primaryLanguage: String
    readme: String
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    githubRepositories: async (_: never, { limit = 20 }, context) =>
      context.dataSources.github.getRepositories(limit),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
