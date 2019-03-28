import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";

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

const recentBooks = async (
  _: never,
  { limit }: { limit: number } = { limit: 10 },
  context: DataSourcesContext
) => context.dataSources.goodreads.getRecentBooks(limit);

const resolvers = {
  Query: {
    recentBooks
  }
};

export default async () =>
  makeExecutableSchema({
    typeDefs,
    resolvers
  });
