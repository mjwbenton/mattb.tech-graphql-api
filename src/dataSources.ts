import { FlickrDataSource } from "./FlickrApi";
import { GoodreadsDataSource } from "./GoodreadsApi";
import { GithubDataSourcce } from "./GithubApi";

const dataSources = {
  flickr: new FlickrDataSource(),
  goodreads: new GoodreadsDataSource(),
  github: new GithubDataSourcce()
};

export default () => dataSources;

export type DataSourcesContext = {
  dataSources: typeof dataSources;
};
