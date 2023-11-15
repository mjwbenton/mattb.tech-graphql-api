import gql from "graphql-tag";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  extend type Query {
    randomNumber: Float!
  }
`;

const resolvers: Resolvers = {
  Query: {
    randomNumber: () => Math.random(),
  },
};

export default {
  typeDefs,
  resolvers,
};
