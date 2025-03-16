import { serviceConfigs } from "./service-configuration";
import { OAuth2Strategy } from "./oauth2";

const strategies = new Map();

export async function startAuthorization(service: string): Promise<string> {
  const strategy = getStrategy(service);
  return strategy.startAuthorization();
}

export async function handleAuthorized(
  service: string,
  query: unknown,
): Promise<void> {
  const strategy = getStrategy(service);
  return strategy.handleAuthorized(query);
}

export async function getAccessToken(service: string): Promise<string> {
  const strategy = getStrategy(service);
  return strategy.getAccessToken();
}

function getStrategy(service: string) {
  if (!strategies.has(service)) {
    const config = serviceConfigs[service];
    if (!config) {
      throw new Error(`Service "${service}" not supported`);
    }

    switch (config.strategy) {
      case "oauth2":
        strategies.set(service, new OAuth2Strategy(config));
        break;
      default:
        throw new Error(`Strategy "${config.strategy}" not implemented`);
    }
  }
  return strategies.get(service);
}
