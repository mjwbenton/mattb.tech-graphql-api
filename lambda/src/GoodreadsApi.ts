import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import request from "request";
import { parseString } from "xml2js";
import { promisify } from "util";
const parseStringPromise = promisify(parseString) as (
  response: string
) => Promise<any>;
const postPromise = promisify(request.post);
import qs from "querystring";
import doAndCache from "./doAndCache";
import moment from "moment";
import { GoodreadsBook } from "./generated/graphql";

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
  shelf: "currently_reading",
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
      GOODREADS_ACCESS_TOKEN_SECRET,
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
      token_secret: GOODREADS_ACCESS_TOKEN_SECRET,
    };
  }

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getRecentBooks({
    perPage,
    page = 1,
  }: {
    perPage: number;
    page: number;
  }) {
    const cacheKey = `recentBooks-${perPage}p${page}`;
    const url = `${BASE_URL}${qs.stringify({
      ...BASE_PARAMS,
      per_page: perPage,
      page,
    })}`;

    return doAndCache(this.cache, cacheKey, async () => {
      const response = await postPromise({
        url,
        oauth: this.oauth,
      });
      const parsed = await parseStringPromise(response.body);
      const total = parsed.GoodreadsResponse.reviews[0]["$"].total;
      const books = parsed.GoodreadsResponse.reviews[0].review
        .map((r: any) => {
          const read = r.rating[0] !== "0";
          const book: GoodreadsBook = {
            id: r.book[0].id[0]["_"],
            title: r.book[0].title[0],
            link: r.book[0].link[0],
            rating: r.rating[0] !== "0" ? parseInt(r.rating[0]) : null,
            image: r.book[0].image_url[0],
            authors: r.book[0].authors.map((a: any) => {
              const nameWithSpaces = a.author[0].name;
              return `${nameWithSpaces}`.replace(/ +/g, " ");
            }),
            read,
            started_at: parseDate(
              r.started_at[0] || (read && r.date_added[0]) || null
            ),
            read_at: parseDate(
              r.read_at[0] || (read && r.date_added[0]) || null
            ),
          };
          return book;
        })
        .filter(({ started_at, read_at }) => started_at || read_at);
      books.sort((x: GoodreadsBook, y: GoodreadsBook) => {
        const xDate: string = x.started_at || x.read_at || "ZZZ";
        const yDate: string = y.started_at || y.read_at || "ZZZ";
        return yDate.localeCompare(xDate);
      });
      return {
        total,
        books,
      };
    });
  }
}

function parseDate(dateStr?: string) {
  if (dateStr == null) {
    return dateStr;
  }
  const parsed = moment(dateStr, "ddd MMM DD HH:mm:ss Z YYYY");
  return parsed.format("YYYY-MM-DD");
}
