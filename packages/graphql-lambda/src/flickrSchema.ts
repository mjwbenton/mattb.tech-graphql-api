import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentPhotos: [Photo!]
    photoSet(photosetId: ID): [Photo!]
    photo(photoId: ID): Photo
  }

  type Photo {
    id: ID!
    pageUrl: String!
    title: String
    mainSource: PhotoSource!
    sources: [PhotoSource!]!
  }

  type PhotoSource {
    url: String!
    width: Int!
    height: Int!
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    recentPhotos: (_: never, __: never, context) =>
      context.dataSources.flickr.getRecentPhotos(),
    photoSet: (_: never, { photosetId }, context) =>
      context.dataSources.flickr.getPhotoSet(photosetId),
    photo: (_: never, { photoId }, context) =>
      context.dataSources.flickr.getPhoto(photoId),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
