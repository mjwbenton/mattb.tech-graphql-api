import * as dotenv from "dotenv";
import { ApolloServer, gql } from "apollo-server-lambda";
import { FlickrDataSource } from "./FlickrApi";
import DynamoDB from "aws-sdk/clients/dynamodb";
import { DynamoDBCache } from "apollo-server-cache-dynamodb";

dotenv.config();

const { FLICKR_API_KEY } = process.env;
const USER_ID = "83914470@N00";

if (!FLICKR_API_KEY) {
  throw new Error("Missing flickr API key");
}

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

const dataSources = {
  flickr: new FlickrDataSource(FLICKR_API_KEY)
};

type ContextType = {
  dataSources: typeof dataSources;
};

const resolvers = {
  Query: {
    recentPhotos: (_: never, __: never, context: ContextType) =>
      context.dataSources.flickr.getRecentPhotos(),
    photoSet: (
      _: never,
      { photosetId }: { photosetId: string },
      context: ContextType
    ) => context.dataSources.flickr.getPhotoSet(photosetId),
    photo: (_: never, { photoId }: { photoId: string }, context: ContextType) =>
      context.dataSources.flickr.getPhoto(photoId)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => dataSources,
  cache: new DynamoDBCache(new DynamoDB.DocumentClient(), {
    tableName: "apollo-cache-table"
  })
});

exports.handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: false
  }
});
