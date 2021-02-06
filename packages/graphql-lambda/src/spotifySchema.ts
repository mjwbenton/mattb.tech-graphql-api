import { gql, makeExecutableSchema } from "apollo-server-lambda";
import { DataSourcesContext } from "./dataSources";
import { Resolvers } from "./generated/graphql";

const typeDefs = gql`
  type Query {
    playlist(playlistId: ID!): Playlist
  }

  type Playlist {
    name: String!
    description: String!
    tracks: [Track!]!
    link: String!
  }

  type Track {
    name: String!
    artists: [Artist!]!
    album: Album!
  }

  type Artist {
    name: String!
  }

  type Album {
    name: String!
    images: [AlbumArt!]!
  }

  type AlbumArt {
    url: String!
    width: Int!
    height: Int!
  }
`;

const resolvers: Resolvers<DataSourcesContext> = {
  Query: {
    playlist: async (_: never, { playlistId }, context) =>
      context.dataSources.spotify.getPlaylist(playlistId),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
