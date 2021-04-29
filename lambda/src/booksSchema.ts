import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import { buildPage, decodeCursor } from "./pagination";

const typeDefs = gql`
  type Query {
    recentGoodreadsBooks(first: Int, after: ID): PaginatedGoodreadsBook!
  }

  type PaginatedGoodreadsBook {
    total: Int!
    items: [GoodreadsBook!]!
    hasNextPage: Boolean!
    nextPageCursor: ID
  }

  type GoodreadsBook {
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
    recentGoodreadsBooks: async (
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
