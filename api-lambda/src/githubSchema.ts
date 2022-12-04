import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    githubRepositories(first: Int, after: ID): PaginatedRepositories!
    githubContributions: GithubContributions!
  }

  type GithubContributions {
    commits: Int!
    repositoriesCommittedTo: Int!
  }

  type PaginatedRepositories {
    total: Int!
    items: [Repository!]!
    hasNextPage: Boolean!
    nextPageCursor: ID
  }

  type Repository {
    id: ID!
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
    githubRepositories: async (
      _: never,
      { first, after },
      { dataSources: { github } }
    ) => github.getRepositories({ first, after }),
    githubContributions: async (
      _: never,
      __: never,
      { dataSources: { github } }
    ) => github.getContributions(),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
