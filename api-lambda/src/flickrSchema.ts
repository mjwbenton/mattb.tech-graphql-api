import { Resolvers } from "./generated/graphql";
import { decodeCursor, buildPage } from "./pagination";
import gql from "graphql-tag";
import { Context } from "./dataSources";

const typeDefs = gql`
  extend type Query {
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
    camera: PhotoTag
    lens: PhotoTag
  }

  type PhotoSource {
    url: String!
    width: Int!
    height: Int!
  }

  type PhotoTag {
    tag: ID!
    name: String!
  }
`;

const DEFAULT_PAGE_SIZE = 50;

const resolvers: Resolvers<Context> = {
  Query: {
    recentPhotos: async (
      _: never,
      { first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } },
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
      { dataSources: { flickr } },
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
      { dataSources: { flickr } },
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
};

export default {
  typeDefs,
  resolvers,
};
