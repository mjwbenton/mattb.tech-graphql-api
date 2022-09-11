import { EcologiDataSource } from "./EcologiApi";
import { FlickrDataSource } from "./FlickrApi";
import { GithubDataSourcce } from "./GithubApi";
import { SpotifyDataSource } from "./SpotifyApi";

const dataSources = {
  spotify: new SpotifyDataSource(),
  flickr: new FlickrDataSource(),
  github: new GithubDataSourcce(),
  ecologi: new EcologiDataSource(),
};

export default () => dataSources;

export type DataSourcesContext = {
  dataSources: typeof dataSources;
};
