import gql from "graphql-tag";
import { Resolvers } from "./generated/graphql";
import { Context } from "./dataSources";
import { buildPage, decodeCursor } from "./pagination";

const typeDefs = gql`
  extend type Query {
    plays(
      startDate: DateTime
      endDate: DateTime
      first: Int
      after: ID
    ): PaginatedPlays!
  }

  type Play {
    id: ID!
    track: Track!
    playedAt: DateTime!
  }

  type PaginatedPlays {
    items: [Play!]!
    total: Int!
    hasNextPage: Boolean!
    nextPageCursor: ID
  }
`;

const resolvers: Resolvers<Context> = {
  Query: {
    plays: async (
      _: never,
      { startDate, endDate, after, first = 10 },
      context,
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { plays, total } = await context.dataSources.lastfm.getTracks({
        startDate,
        endDate,
        perPage,
        page,
      });
      return buildPage({ total, perPage, page, items: plays });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
