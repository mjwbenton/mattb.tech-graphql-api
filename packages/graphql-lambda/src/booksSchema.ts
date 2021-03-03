import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentBooks(limit: Int): [Book!]
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
      { limit = 10 },
      { dataSources: { goodreads, googleBooks } }
    ) => {
      const result = await goodreads.getRecentBooks(limit);
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
