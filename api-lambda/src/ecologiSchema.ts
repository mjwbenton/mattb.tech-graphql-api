import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    climateImpact: ClimateImpact!
  }

  type ClimateImpact {
    trees: Int!
    carbonOffsetTonnes: Float!
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
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
