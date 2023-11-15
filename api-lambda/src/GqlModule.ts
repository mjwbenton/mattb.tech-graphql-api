import { DocumentNode } from "graphql";
import merge from "lodash.merge";
import gql from "graphql-tag";
import { Context } from "./dataSources";
import { Resolvers } from "./generated/graphql";

export interface GqlModule {
  typeDefs: DocumentNode;
  resolvers: Resolvers<Context>;
}

export function combineModules(...modules: GqlModule[]): GqlModule {
  const [firstModule, ...rest] = modules;
  if (!firstModule) {
    throw new Error("No modules provided");
  }
  return rest.reduce(
    (acc, module) => ({
      typeDefs: gql`
        ${acc.typeDefs}
        ${module.typeDefs}
      `,
      resolvers: merge(acc.resolvers, module.resolvers),
    }),
    firstModule,
  );
}
