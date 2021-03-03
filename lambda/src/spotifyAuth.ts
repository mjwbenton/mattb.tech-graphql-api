import request from "request-promise-native";

function buildAuthorizationRequestAuthHeader() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const inBase64 = Buffer.from(clientId + ":" + clientSecret).toString(
    "base64"
  );
  return `Basic ${inBase64}`;
}

async function makeClientAuthRequest() {
  return await request({
    method: "POST",
    uri: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "client_credentials",
    },
    headers: {
      Authorization: buildAuthorizationRequestAuthHeader(),
    },
    json: true,
  });
}

let header: string | null = null;
export async function getAuthorizationHeader() {
  if (header == null) {
    const response = await makeClientAuthRequest();
    header = `Bearer ${response.access_token}`;
  }
  return header;
}
