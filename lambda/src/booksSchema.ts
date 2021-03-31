import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentBooks(perPage: Int, page: Int): [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    link: String!
    rating: Int
    image: String!
    authors: [String!]!
    read: Boolean!
    started_at: String
    read_at: String
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    recentBooks: async (
      _: never,
      { perPage, page },
      { dataSources: { goodreads, googleBooks } }
    ) => {
      const result = await goodreads.getRecentBooks({ perPage, page });
      return Promise.all(
        result.map(async (book) => {
          const gbResult = await googleBooks.search({
            id: book.id,
            title: book.title,
            author: book.authors[0],
          });
          if (gbResult !== null) {
            return { ...book, image: gbResult.image };
          }
          return book;
        })
      );
    },
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
