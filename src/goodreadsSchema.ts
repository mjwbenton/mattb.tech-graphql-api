import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";

const typeDefs = gql`
  type Query {
    recentBooks: [Book]
  }

  type Book {
    title: String
    link: String
    ratings: String
    year: String
    image: String
    authors: [String]
    read: Boolean
    started_at: String
    read_at: String
  }
`;

const recentBooks = async (
  _: never,
  __: never,
  context: DataSourcesContext
) => {
  const result = context.dataSources.goodreads.getBooks();
  console.log(JSON.stringify(result, null, 2));
  return result;
};

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
