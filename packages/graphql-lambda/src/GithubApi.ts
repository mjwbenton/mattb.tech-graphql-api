import { DataSource, DataSourceConfig } from "apollo-datasource";
import { KeyValueCache } from "apollo-server-core";
import fetch from "node-fetch";
import doAndCache from "./doAndCache";

const LOGIN = "mjwbenton";

const QUERY = (limit: number) => `{
  repositoryOwner(login: "${LOGIN}") {
    repositories(
      first: ${limit}
      privacy: PUBLIC
      isFork: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      edges {
        node {
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

  public async getRepositories(limit: number) {
    const cacheKey = `recentRepositories-limit-${limit}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await this.fetch(QUERY(limit));
      const edges = response.data.repositoryOwner.repositories.edges;
      return edges
        .map((edge) => edge.node)
        .map(
          ({
            name,
            createdAt,
            description,
            licenseInfo,
            primaryLanguage,
            updatedAt,
            url,
            readme,
          }) => ({
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
