import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import { buildPage, decodeCursor } from "./pagination";

const DEFAULT_PAGE_SIZE = 20;

const typeDefs = gql`
  type Query {
    recentBooks(first: Int, after: ID): PaginatedBooks
  }

  type PaginatedBooks {
    total: Int!
    items: [Book!]!
    hasNextPage: Boolean!
    nextPageCursor: ID
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
      { first, after },
      { dataSources: { goodreads, googleBooks } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { books, total } = await goodreads.getRecentBooks({
        perPage,
        page,
      });
      const items = await Promise.all(
        books.map(async (book) => {
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
      return buildPage({
        items,
        total,
        perPage,
        page,
      });
    },
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
