import fetch from "node-fetch";
import { print } from "graphql";
import { Executor } from "@graphql-tools/delegate";

const buildExecutor: (endpoint: string) => Executor =
  (endpoint) =>
  async ({ document, variables }) => {
    const query = print(document);
    const fetchResult = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json();
  };

export default buildExecutor;
