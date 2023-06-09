import gql from "graphql-tag";
import { Resolvers } from "./generated/graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

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
