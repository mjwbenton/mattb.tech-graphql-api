import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import request from "request-promise-native";
import { parseString } from "xml2js";
import { promisify } from "util";
const parseStringPromise = promisify(parseString) as (
  response: string
) => Promise<any>;
import qs from "querystring";
import doAndCache from "./doAndCache";

const USER_ID = "10445595";

type GoodreadsOauth = {
  consumer_key: string;
  consumer_secret: string;
  token: string;
  token_secret: string;
};

const BASE_URL = `https://www.goodreads.com/review/list/${USER_ID}.xml?`;
const BASE_PARAMS = {
  v: 2,
  sort: "date_started",
  shelf: "read",
  page_page: 200
};

export class GoodreadsDataSource<TContext = any> extends DataSource {
  private cache!: KeyValueCache;
  private oauth: GoodreadsOauth;

  constructor() {
    super();
    const {
      GOODREADS_KEY,
      GOODREADS_SECRET,
      GOODREADS_ACCESS_TOKEN,
      GOODREADS_ACCESS_TOKEN_SECRET
    } = process.env;
    if (
      !GOODREADS_KEY ||
      !GOODREADS_SECRET ||
      !GOODREADS_ACCESS_TOKEN ||
      !GOODREADS_ACCESS_TOKEN_SECRET
    ) {
      throw new Error("Missing goodreads oauth keys");
    }
    this.oauth = {
      consumer_key: GOODREADS_KEY,
      consumer_secret: GOODREADS_SECRET,
      token: GOODREADS_ACCESS_TOKEN,
      token_secret: GOODREADS_ACCESS_TOKEN_SECRET
    };
  }

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getBooks() {
    const cacheKey = `books`;
    const url = `${BASE_URL}${qs.stringify({
      ...BASE_PARAMS
    })}`;

    return doAndCache(this.cache, cacheKey, async () => {
      const response = await request.post({
        url,
        oauth: this.oauth
      });
      const parsed = await parseStringPromise(response);
      return parsed.GoodreadsResponse.reviews[0].review.map(r => ({
        title: r.book[0].title[0],
        link: r.book[0].link[0],
        rating: r.rating[0] !== "0" ? r.rating[0] : null,
        year: r.book[0].published[0],
        image: r.book[0].image_url[0],
        authors: r.book[0].authors.map(a => {
          const nameWithSpaces = a.author[0].name;
          return `${nameWithSpaces}`.replace(/ +/g, " ");
        }),
        read: r.rating[0] !== "0",
        started_at: r.started_at[0] || null,
        read_at: r.read_at[0] || null
      }));
    });
  }
}
