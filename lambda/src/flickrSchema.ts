import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentPhotos(perPage: Int, page: Int): [Photo!]
    photoSet(photosetId: ID!, perPage: Int, page: Int): [Photo!]
    photo(photoId: ID!): Photo
    photosWithTag(tag: ID!, perPage: Int, page: Int): [Photo!]
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
    recentPhotos: (_: never, { perPage, page }, { dataSources: { flickr } }) =>
      flickr.getRecentPhotos({ perPage, page }),
    photoSet: (
      _: never,
      { photosetId, perPage, page },
      { dataSources: { flickr } }
    ) => flickr.getPhotoSet({ photosetId, perPage, page }),
    photo: (_: never, { photoId }, { dataSources: { flickr } }) =>
      flickr.getPhoto(photoId),
    photosWithTag: (
      _: never,
      { tag, perPage, page },
      { dataSources: { flickr } }
    ) => flickr.getPhotosWithTag({ tag, perPage, page }),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
