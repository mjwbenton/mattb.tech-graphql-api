import { FlickrDataSource } from "./FlickrApi";
import { GoodreadsDataSource } from "./GoodreadsApi";

const dataSources = {
  flickr: new FlickrDataSource(),
  goodreads: new GoodreadsDataSource()
};

export default () => dataSources;

export type DataSourcesContext = {
  dataSources: typeof dataSources;
};
