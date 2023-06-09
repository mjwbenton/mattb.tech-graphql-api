import { makeExecutableSchema } from "@graphql-tools/schema";
import { Context } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
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

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
