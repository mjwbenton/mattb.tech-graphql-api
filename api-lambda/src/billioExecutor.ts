import fetch from "node-fetch";
import { print } from "graphql";
import { Executor } from "@graphql-tools/delegate";

const ENDPOINT = "https://api-readonly.billio.mattb.tech";

const executor: Executor = async ({ document, variables }) => {
  const query = print(document);
  const fetchResult = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return fetchResult.json();
};

export default executor;
