import * as dotenv from "dotenv";
dotenv.config();

const { GOODREADS_KEY, GOODREADS_SECRET } = process.env;

import qs from "querystring";
import readline from "readline";
import { OAuth } from "oauth";

const BASE_URL = "https://www.goodreads.com/oauth/";
const REQUEST_TOKEN_URL = `${BASE_URL}request_token`;
const ACCESS_TOKEN_URL = `${BASE_URL}access_token`;
const AUTHORIZE_URL = `${BASE_URL}authorize`;

const oauth = new OAuth(
  REQUEST_TOKEN_URL,
  ACCESS_TOKEN_URL,
  GOODREADS_KEY,
  GOODREADS_SECRET,
  "1.0A",
  "",
  "HMAC-SHA1"
);

type Tokens = {
  token: string;
  secret: string;
};

async function run() {
  const requestTokens = await new Promise<Tokens>((resolve, reject) => {
    oauth.getOAuthRequestToken((error, token, secret) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          token,
          secret
        });
      }
    });
  });

  console.log(
    `${AUTHORIZE_URL}?${qs.stringify({
      oauth_token: requestTokens.token
    })}`
  );

  await confirmAcceptance();

  const accessTokens = await new Promise<Tokens>((resolve, reject) => {
    oauth.getOAuthAccessToken(
      requestTokens.token,
      requestTokens.secret,
      "1",
      (error, token, secret) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            token,
            secret
          });
        }
      }
    );
  });

  console.log(
    `GOODREADS_ACCESS_TOKEN=${
      accessTokens.token
    }\nGOODREADS_ACCESS_TOKEN_SECRET=${accessTokens.secret}`
  );
}

async function confirmAcceptance() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question("Have you authorized?", answer => {
      rl.close();
      resolve();
    })
  );
}

run();
