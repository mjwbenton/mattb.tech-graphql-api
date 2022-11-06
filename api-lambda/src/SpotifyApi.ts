import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import axios from "axios";
import doAndCache from "./doAndCache";
import { getAccessToken } from "@mattb.tech/graphql-api-oauth-lib";

export type Playlist = {
  id: string;
  name: string;
  description: string;
  tracks: Array<Track>;
  link: string;
};

export type Track = {
  id: string;
  name: string;
  artists: Array<Artist>;
  album: Album;
};

export type Artist = {
  id: string;
  name: string;
};

export type Album = {
  id: string;
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
      const accessToken = await getAccessToken("spotify");
      const response = (
        await axios.get(`https://api.spotify.com/v1/playlists/${playlist}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
      const { id, name, description } = response;
      const link = response.external_urls.spotify;
      const tracks: Array<Track> = response.tracks.items.map((t: any) => {
        return {
          id: t.track.id,
          name: t.track.name,
          album: {
            id: t.track.album.id,
            name: t.track.album.name,
            images: t.track.album.images,
          },
          artists: t.track.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
          })),
        };
      });
      return { id, name, description, tracks, link };
    });
  }

  public async getLikedTracks(limit: number = 3): Promise<Array<Track>> {
    const cacheKey = `likedTracks-${limit}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const accessToken = await getAccessToken("spotify");
      const response = (
        await axios.get(`https://api.spotify.com/v1/me/tracks?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
      const tracks: Array<Track> = response.items.map((t: any) => {
        return {
          id: t.track.id,
          name: t.track.name,
          album: {
            id: t.track.album.id,
            name: t.track.album.name,
            images: t.track.album.images,
          },
          artists: t.track.artists.map((a: any) => ({
            id: a.id,
            name: a.name,
          })),
        };
      });
      return tracks;
    });
  }
}
