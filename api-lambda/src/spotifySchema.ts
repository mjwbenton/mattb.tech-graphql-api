import gql from "graphql-tag";
import { Resolvers } from "./generated/graphql";
import { Context } from "./dataSources";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = gql`
  type Query {
    playlist(playlistId: ID!): Playlist
    likedTracks(limit: Int): [Track!]!
  }

  type Playlist {
    id: ID!
    name: String!
    description: String!
    tracks: [Track!]!
    link: String!
  }

  type Track {
    id: ID!
    name: String!
    artists: [Artist!]!
    album: Album!
  }

  type Artist {
    id: ID!
    name: String!
  }

  type Album {
    id: ID!
    name: String!
    images: [AlbumArt!]!
  }

  type AlbumArt {
    url: String!
    width: Int!
    height: Int!
  }
`;

const resolvers: Resolvers<Context> = {
  Query: {
    playlist: async (_: never, { playlistId }, context) =>
      context.dataSources.spotify.getPlaylist(playlistId),
    likedTracks: async (_: never, { limit }, context) =>
      context.dataSources.spotify.getLikedTracks(limit),
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
