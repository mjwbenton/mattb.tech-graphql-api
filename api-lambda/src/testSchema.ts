import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    randomNumber: Float!
  }
`;

const resolvers: Resolvers = {
  Query: {
    randomNumber: () => Math.random(),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
