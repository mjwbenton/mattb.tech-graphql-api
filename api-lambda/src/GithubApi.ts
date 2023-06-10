import fetch from "node-fetch";
import doAndCache from "./doAndCache";
import { CommitStats, PaginatedRepositories } from "./generated/graphql";
import env from "./env";
import formatISO from "date-fns/formatISO";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";

const LOGIN = "mjwbenton";

const REPOSITORIES_QUERY = (first: number, after?: string) => `{
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

const CONTRIBUTIONS_QUERY = (from: string, to: string) => `
{
  user(login:"${LOGIN}") {
    contributionsCollection(from: "${from}", to: "${to}") {
      totalCommitContributions
      totalRepositoriesWithContributedCommits
    }
  }
}
`;

export class GithubDataSourcce {
  private githubToken: string;

  constructor(private readonly cache: KeyValueCache) {
    const { GH_TOKEN } = env;
    if (!GH_TOKEN) {
      throw new Error("Missing github token");
    }
    this.githubToken = GH_TOKEN;
  }

  public async getCommitStats(from: Date, to: Date): Promise<CommitStats> {
    const cacheKey = `commitStats-${formatISO(from)}-${formatISO(to)}`;
    return doAndCache(this.cache, cacheKey, async () => {
      const response = await this.fetch(
        CONTRIBUTIONS_QUERY(formatISO(from), formatISO(to))
      );
      if (response.errors) {
        throw new Error(JSON.stringify(response.errors));
      }
      return {
        commits:
          response.data.user.contributionsCollection.totalCommitContributions,
        repositoriesCommittedTo:
          response.data.user.contributionsCollection
            .totalRepositoriesWithContributedCommits,
      };
    });
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
      const response = await this.fetch(REPOSITORIES_QUERY(first, after));
      if (response.errors) {
        throw new Error(JSON.stringify(response.errors));
      }
      const { edges, totalCount, pageInfo } =
        response.data.repositoryOwner.repositories;
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
