import * as crypto from "crypto";

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/%20/g, "+");
}

function createOauthBaseParams() {
  return {
    oauth_nonce: crypto.randomBytes(8).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };
}

function createSigningKey(firstPart: string, secondPart: string = ""): string {
  return [firstPart, secondPart].map(percentEncode).join("&");
}

function generateSignature({
  signingKey,
  url,
  params,
}: {
  signingKey: string;
  url: string;
  params: Record<string, string>;
}): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  // Create signature base string
  const signatureBase = [
    "POST",
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&");

  // Generate HMAC-SHA1 signature
  const hmac = crypto.createHmac("sha1", signingKey);
  hmac.update(signatureBase);
  return hmac.digest("base64");
}

function generateAuthorizationHeader(params: Record<string, string>): string {
  const header = Object.keys(params)
    .filter((key) => key.startsWith("oauth_"))
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(params[key])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

export default {
  percentEncode,
  createOauthBaseParams,
  generateSignature,
  createSigningKey,
  generateAuthorizationHeader,
};
