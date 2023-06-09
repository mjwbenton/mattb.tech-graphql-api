import axios from "axios";
import doAndCache from "./doAndCache";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";

const CACHE_KEY = "climate-impact";

export type ClimateImpact = {
  trees: number;
  carbonOffsetTonnes: number;
};

export class EcologiDataSource {
  constructor(private readonly cache: KeyValueCache) {}

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
