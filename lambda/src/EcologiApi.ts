import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import axios from "axios";
import dataSources from "./dataSources";
import doAndCache from "./doAndCache";

const CACHE_KEY = "climate-impact";

export type ClimateImpact = {
  trees: number;
  carbonOffsetTonnes: number;
};

export class EcologiDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getClimateImpact(): Promise<ClimateImpact> {
    return doAndCache(this.cache, CACHE_KEY, async () => {
      const response = (
        await axios.get(`https://public.ecologi.com/users/matthewbenton/impact`)
      ).data;
      return {
        trees: response.trees,
        carbonOffsetTonnes: response.carbonOffset,
      };
    });
  }
}
