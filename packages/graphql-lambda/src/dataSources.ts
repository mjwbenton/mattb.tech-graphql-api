import { FlickrDataSource } from "./FlickrApi";
import { GoodreadsDataSource } from "./GoodreadsApi";
import { GithubDataSourcce } from "./GithubApi";
import { SpotifyDataSource } from "./SpotifyApi";
import { GoogleBooksDataSource } from "./GoogleBooksApi";

const dataSources = {
  spotify: new SpotifyDataSource(),
  flickr: new FlickrDataSource(),
  goodreads: new GoodreadsDataSource(),
  github: new GithubDataSourcce(),
  googleBooks: new GoogleBooksDataSource(),
};

export default () => dataSources;

export type DataSourcesContext = {
  dataSources: typeof dataSources;
};
