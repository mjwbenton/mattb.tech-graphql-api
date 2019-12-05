import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";

const typeDefs = gql`
  type Query {
    githubRepositories(limit: Int): [Repository]
  }

  type Repository {
    name: String!
    url: String!
    createdAt: String!
    updatedAt: String!
    description: String
    license: String
    primaryLanguage: String
    readme: String
  }
`;

const githubRepositories = async (
  _: never,
  { limit = 20 }: { limit: number },
  context: DataSourcesContext
) => context.dataSources.github.getRepositories(limit);

const resolvers = {
  Query: {
    githubRepositories
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
