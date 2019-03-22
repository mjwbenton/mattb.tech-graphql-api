import { FlickrDataSource } from "./FlickrApi";

const dataSources = {
  flickr: new FlickrDataSource()
};

export default () => dataSources;

export type DataSourcesContext = {
  dataSources: typeof dataSources;
};
