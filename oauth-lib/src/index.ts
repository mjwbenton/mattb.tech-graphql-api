import { services } from "./services";
import oauth1Utils from "./oauth1Utils";

export async function startAuthorization(service: string): Promise<string> {
  return getStrategy(service).startAuthorization();
}

export async function handleAuthorized(
  service: string,
  query: unknown,
): Promise<void> {
  return getStrategy(service).handleAuthorized(query);
}

export async function getAccessToken(service: string): Promise<string> {
  return getStrategy(service).getAccessToken();
}

function getStrategy(service: string) {
  const strategy = services[service];
  if (!strategy) {
    throw new Error(`Service "${service}" not supported`);
  }
  return strategy;
}

export { oauth1Utils };
