import gql from "graphql-tag";
import { Context } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import { DateTimeResolver as DateTime } from "graphql-scalars";

const typeDefs = gql`
  scalar DateTime

  extend type Query {
    repositories(first: Int, after: ID): PaginatedRepositories!
    commitStats(startDate: DateTime!, endDate: DateTime!): CommitStats!
  }

  type CommitStats {
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

const resolvers: Resolvers<Context> = {
  DateTime,
  Query: {
    repositories: async (_, { first, after }, { dataSources: { github } }) =>
      github.getRepositories({ first, after }),
    commitStats: async (
      _,
      { startDate, endDate },
      { dataSources: { github } },
    ) => github.getCommitStats(startDate, endDate),
  },
};

export default {
  typeDefs,
  resolvers,
};
