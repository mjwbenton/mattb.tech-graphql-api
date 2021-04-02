import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    recentPhotos(first: Int, after: ID): PaginatedPhotos!
    photoSet(photosetId: ID!, first: Int, after: ID): PaginatedPhotos!
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

// Uses the format ${perPage}.${page} for the cursor encoded base64
function decodeCursor({
  first,
  after,
}: {
  first: number;
  after?: string;
}): { perPage: number; page: number } {
  if (!after) {
    return { perPage: first, page: 1 };
  }
  const cursor = Buffer.from(after, "base64").toString("ascii").split(".");
  if (cursor.length !== 2) {
    throw new Error(`Invalid cursor ${after}`);
  }
  if (cursor[0] !== first.toString()) {
    throw new Error(
      `Changing page size between calls unsupported. Was ${cursor[0]}, requested ${first}.`
    );
  }
  return {
    perPage: first,
    page: parseInt(cursor[1]),
  };
}

function encodeCursor({
  perPage,
  page,
}: {
  perPage: number;
  page: number;
}): string {
  return Buffer.from(`${perPage}.${page}`).toString("base64");
}

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    recentPhotos: async (
      _: never,
      { first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { photos, pages, total } = await flickr.getRecentPhotos({
        perPage,
        page,
      });
      return {
        items: photos,
        total,
        hasNextPage: page < pages,
        nextPageCursor:
          page < pages ? encodeCursor({ perPage, page: page + 1 }) : null,
      };
    },
    photoSet: async (
      _: never,
      { photosetId, first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { photos, pages, total } = await flickr.getPhotoSet({
        photosetId,
        perPage,
        page,
      });
      return {
        items: photos,
        total,
        hasNextPage: page < pages,
        nextPageCursor:
          page < pages ? encodeCursor({ perPage, page: page + 1 }) : null,
      };
    },
    photosWithTag: async (
      _: never,
      { tag, first = DEFAULT_PAGE_SIZE, after },
      { dataSources: { flickr } }
    ) => {
      const { perPage, page } = decodeCursor({ first, after });
      const { photos, pages, total } = await flickr.getPhotosWithTag({
        tag,
        perPage,
        page,
      });
      return {
        items: photos,
        total,
        hasNextPage: page < pages,
        nextPageCursor:
          page < pages ? encodeCursor({ perPage, page: page + 1 }) : null,
      };
    },
    photo: (_: never, { photoId }, { dataSources: { flickr } }) =>
      flickr.getPhoto(photoId),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
