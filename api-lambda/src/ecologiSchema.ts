import { Context } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import gql from "graphql-tag";

const typeDefs = gql`
  extend type Query {
    climateImpact: ClimateImpact!
  }

  type ClimateImpact {
    trees: Int!
    carbonOffsetTonnes: Float!
  }
`;

const resolvers: Resolvers<Context> = {
  Query: {
    climateImpact: async (
      _: never,
      __: never,
      { dataSources: { ecologi } }
    ) => {
      return ecologi.getClimateImpact();
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
