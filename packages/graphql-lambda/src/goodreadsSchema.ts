import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentBooks(limit: Int): [Book]
  }

  type Book {
    title: String!
    link: String!
    rating: Int
    image: String
    authors: [String]!
    read: Boolean!
    started_at: String
    read_at: String
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    recentBooks: async (_: never, { limit = 10 }, context) =>
      context.dataSources.goodreads.getRecentBooks(limit),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
