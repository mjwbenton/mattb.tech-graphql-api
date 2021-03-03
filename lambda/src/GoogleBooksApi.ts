import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import requestPromise from "request-promise-native";
import doAndCache from "./doAndCache";

interface GoogleBook {
  readonly image: string;
}

const BASE_URL = "https://www.googleapis.com/books/v1/volumes?q=";
// Example: `${BASE_URL}intitle:%22James+Acaster%27s+Classic+Scrapes%22+inauthor:%22James+Acaster%22`

export class GoogleBooksDataSource extends DataSource {
  private cache: KeyValueCache;

  initialize(config: DataSourceConfig<unknown>): void {
    this.cache = config.cache;
  }

  public async search({
    id,
    title,
    author,
  }: {
    id: string;
    title: string;
    author: string;
  }): Promise<GoogleBook | null> {
    const cacheKey = `google-books-id-${id}`;
    return doAndCache(this.cache, cacheKey, async () => {
      // Handle sub-titles which the Google Books API handles seperately
      const searchTitle = title.split(":")[0];
      const url = BASE_URL.concat(
        `intitle:%22${encodeURIComponent(
          searchTitle
        )}%22+inauthor:%22${encodeURIComponent(author)}%22`
      );
      const result = JSON.parse(await requestPromise(url));
      const image =
        result?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ?? null;
      return image ? { image } : null;
    });
  }
}
