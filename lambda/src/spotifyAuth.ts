import axios from "axios";
import qs from "querystring";

const QUERY = qs.stringify({
  grant_type: "client_credentials",
});

async function makeClientAuthRequest() {
  return (
    await axios.post("https://accounts.spotify.com/api/token", QUERY, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.SPOTIFY_CLIENT_ID,
        password: process.env.SPOTIFY_CLIENT_SECRET,
      },
    })
  ).data;
}

let header: string | null = null;
export async function getAuthorizationHeader() {
  if (header == null) {
    const response = await makeClientAuthRequest();
    header = `Bearer ${response.access_token}`;
  }
  return header;
}
