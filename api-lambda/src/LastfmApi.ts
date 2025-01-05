import axios from "axios";
import doAndCache from "./doAndCache";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import env from "./env";
import { getUnixTime } from "date-fns";
import { Play } from "./generated/graphql";

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

export class LastfmDataSource {
  constructor(private readonly cache: KeyValueCache) {}

  public async getTracks({
    startDate,
    endDate,
    page,
    perPage,
  }: {
    perPage: number;
    page?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ total: number; plays: Array<Play> }> {
    return await doAndCache(
      this.cache,
      `tracks-${startDate}-${endDate}-${perPage}-${page}`,
      async () => {
        const response = await fetchTracks({
          startDate,
          endDate,
          page,
          perPage: perPage || 1, // Last.fm API requires a perPage of at least 1
        });
        const total = parseInt(response.recenttracks["@attr"].total, 10);
        if (perPage === 0) {
          return { total, plays: [] };
        }
        const plays: Array<Play> = response.recenttracks.track.map((t: any) => {
          return {
            id: `${t.mbid}-${t.date.uts}`,
            playedAt: new Date(parseInt(t.date.uts, 10) * 1000),
            track: {
              id: t.mbid,
              name: t.name,
              album: {
                id: t.album.mbid,
                name: t.album["#text"],
                images: t.image.map((i: any) => ({
                  url: i["#text"],
                  ...parseSizeFromImageUrl(i["#text"]),
                })),
              },
              artists: [{ id: t.artist.mbid, name: t.artist["#text"] }],
            },
          };
        });
        return { total, plays };
      },
    );
  }
}

async function fetchTracks({ startDate, endDate, page, perPage }) {
  return (
    await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=z-two&api_key=${env.LASTFM_API_KEY}&format=json&limit=${perPage}&page=${page}&from=${getUnixTime(startDate)}&to=${getUnixTime(endDate)}`,
    )
  ).data;
}

function parseSizeFromImageUrl(url: string): { width: number; height: number } {
  const matchX = url.match(/\/(\d+)x(\d+)\//);
  if (matchX) {
    return { width: parseInt(matchX[1], 10), height: parseInt(matchX[2], 10) };
  }
  const matchS = url.match(/\/(\d+)s\//);
  if (matchS) {
    return { width: parseInt(matchS[1], 10), height: parseInt(matchS[1], 10) };
  }
  return { width: 0, height: 0 };
}
