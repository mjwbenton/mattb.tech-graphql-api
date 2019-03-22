import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";

const typeDefs = gql`
  type Query {
    recentPhotos: [Photo]
    photoSet(photosetId: ID): [Photo]
    photo(photoId: ID): Photo
  }

  type Photo {
    id: ID
    pageUrl: String
    title: String
    mainSource: PhotoSource
    sources: [PhotoSource]
  }

  type PhotoSource {
    url: String
    width: Int
    height: Int
  }
`;

const resolvers = {
  Query: {
    recentPhotos: (_: never, __: never, context: DataSourcesContext) =>
      context.dataSources.flickr.getRecentPhotos(),
    photoSet: (
      _: never,
      { photosetId }: { photosetId: string },
      context: DataSourcesContext
    ) => context.dataSources.flickr.getPhotoSet(photosetId),
    photo: (
      _: never,
      { photoId }: { photoId: string },
      context: DataSourcesContext
    ) => context.dataSources.flickr.getPhoto(photoId)
  }
};

export default async () =>
  makeExecutableSchema({
    typeDefs,
    resolvers
  });
