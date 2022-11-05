import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";
import { decodeCursor, buildPage } from "./pagination";

const typeDefs = gql`
  type Query {
    recentPhotos(first: Int, after: ID): PaginatedPhotos!
    photoSet(photosetId: ID!, first: Int, after: ID): PaginatedPhotos
    photo(photoId: ID!): Photo
    photosWithTag(tag: ID!, first: Int, after: ID): PaginatedPhotos!
  }

  type PaginatedPhotos {
    items: [Photo!]!
    total: Int!
    hasNextPage: Boolean!
    nextPageCursor: ID
  }

  type Photo {
    id: ID!
    pageUrl: String!
    title: String
    description: String
    mainSource: PhotoSource!
    sources: [PhotoSource!]!
  }

  type PhotoSource {
    url: String!
    width: Int!
    height: Int!
  }
`;

const DEFAULT_PAGE_SIZE = 50;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    recentPhotos: async (
      _: never,
      { first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { photos, total } = await flickr.getRecentPhotos({
        perPage,
        page,
      });
      return buildPage({
        items: photos,
        total,
        perPage,
        page,
      });
    },
    photoSet: async (
      _: never,
      { photosetId, first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const result = await flickr.getPhotoSet({
        photosetId,
        perPage,
        page,
      });
      if (!result) {
        return null;
      }
      return buildPage({
        items: result.photos,
        total: result.total,
        perPage,
        page,
      });
    },
    photosWithTag: async (
      _: never,
      { tag, first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { photos, total } = await flickr.getPhotosWithTag({
        tag,
        perPage,
        page,
      });
      return buildPage({
        items: photos,
        total,
        perPage,
        page,
      });
    },
    photo: (_: never, { photoId }, { dataSources: { flickr } }) =>
      flickr.getPhoto(photoId),
  },
  Photo: {
    description: async (
      { id }: { id: string },
      _: never,
      { dataSources: { flickr } }
    ) => {
      return await flickr.getDescription(id);
    },
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
