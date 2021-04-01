import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import fetch from "node-fetch";
import doAndCache from "./doAndCache";
import { PaginatedRepositories } from "./generated/graphql";

const LOGIN = "mjwbenton";

const QUERY = (first: number, after?: string) => `{
  repositoryOwner(login: "${LOGIN}") {
    repositories(
      first: ${first}
      ${after ? `after: "${after}"` : ""}
      privacy: PUBLIC
      isFork: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          createdAt
          description
          licenseInfo {
            name
          }
          primaryLanguage {
            name
          }
          updatedAt
          url
          readme: object(expression: "master:README.md") {
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}`;

export class GithubDataSourcce<TContext = any> extends DataSource {
  private cache!: KeyValueCache;
  private githubToken: string;

  constructor() {
    super();
    const { GITHUB_TOKEN } = process.env;
    if (!GITHUB_TOKEN) {
      throw new Error("Missing github token");
    }
    this.githubToken = GITHUB_TOKEN;
  }

  initialize(config: DataSourceConfig<TContext>): void {
    this.cache = config.cache;
  }

  public async getRepositories({
    first = 20,
    after = null,
  }: {
    first?: number;
    after?: string;
  }): Promise<PaginatedRepositories> {
    const cacheKey = `recentRepositories-first-${first}-after-${after}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await this.fetch(QUERY(first, after));
      if (response.errors) {
        throw new Error(JSON.stringify(response.errors));
      }
      const {
        edges,
        totalCount,
        pageInfo,
      } = response.data.repositoryOwner.repositories;
      const items = edges
        .map((edge) => edge.node)
        .map(
          ({
            id,
            name,
            createdAt,
            description,
            licenseInfo,
            primaryLanguage,
            updatedAt,
            url,
            readme,
          }) => ({
            id,
            name,
            url,
            createdAt,
            updatedAt,
            description,
            license: (licenseInfo || {}).name || null,
            primaryLanguage: (primaryLanguage || {}).name || null,
            readme: (readme || {}).text || null,
          })
        );

      return {
        total: totalCount,
        hasNextPage: pageInfo.hasNextPage,
        nextPageCursor: pageInfo.endCursor,
        items,
      };
    });
  }

  private async fetch(query: string): Promise<any> {
    const fetchResult = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${this.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ operationName: null, variables: {}, query }),
    });
    return fetchResult.json();
  }
}
