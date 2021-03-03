import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import request from "request-promise-native";
import doAndCache from "./doAndCache";

import { getAuthorizationHeader } from "./spotifyAuth";

export type Playlist = {
  name: string;
  description: string;
  tracks: Array<Track>;
  link: string;
};

export type Track = {
  name: string;
  artists: Array<Artist>;
  album: Album;
};

export type Artist = {
  name: string;
};

export type Album = {
  name: string;
  images: Array<Image>;
};

export type Image = {
  url: string;
  width: number;
  height: number;
};

export class SpotifyDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getPlaylist(playlist: string): Promise<Playlist> {
    const cacheKey = `playlist-${playlist}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const authHeader = await getAuthorizationHeader();
      const response = await request({
        method: "GET",
        uri: `https://api.spotify.com/v1/playlists/${playlist}`,
        headers: {
          Authorization: authHeader,
        },
        json: true,
      });
      const { name, description } = response;
      const link = response.external_urls.spotify;
      const tracks: Array<Track> = response.tracks.items.map((t: any) => {
        return {
          name: t.track.name,
          album: {
            name: t.track.album.name,
            images: t.track.album.images,
          },
          artists: t.track.artists.map((a: any) => ({
            name: a.name,
          })),
        };
      });
      return { name, description, tracks, link };
    });
  }
}
