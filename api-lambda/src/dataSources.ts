import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import { EcologiDataSource } from "./EcologiApi";
import { FlickrDataSource } from "./FlickrApi";
import { GithubDataSourcce } from "./GithubApi";
import { SpotifyDataSource } from "./SpotifyApi";
import { LastfmDataSource } from "./LastfmApi";

export default function dataSources(cache: KeyValueCache) {
  return {
    spotify: new SpotifyDataSource(cache),
    flickr: new FlickrDataSource(cache),
    github: new GithubDataSourcce(cache),
    ecologi: new EcologiDataSource(cache),
    lastfm: new LastfmDataSource(cache),
  };
}

export type Context = {
  dataSources: ReturnType<typeof dataSources>;
};
