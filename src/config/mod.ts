import "dotenv/load";
import { Assert } from "../utils/assert.ts";

export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

// prettier-ignore
export namespace Config {
  export const ENVIRONMENT = getEnvOrDefault("ENVIRONMENT", Environment.DEVELOPMENT);
  export const PORT = getEnvMap("PORT", Number);
  export const CONSOLE_LOG_ERRORS = getEnvOrDefault("CONSOLE_LOG_ERRORS", "false") === "true";
  export const REDIS_HOST = getEnvOrThrow("REDIS_HOST");
  export const REDIS_PORT = getEnvOrThrow("REDIS_PORT");
  export const REDIS_PASSWORD = getEnvOrThrow("REDIS_PASSWORD");
  export const TOKEN_SECRET = getEnvOrThrow("TOKEN_SECRET");
  export const TOKEN_EXPIRES_MS = Number(getEnvOrThrow("TOKEN_EXPIRES_MS"));

  export function isDevelopment(): boolean {
    return ENVIRONMENT === Environment.DEVELOPMENT;
  }
}

function getEnvOrThrow(key: string): string {
  const value = Deno.env.get(key);
  Assert.nonNull(value, `${key} is not defined`);
  return value;
}

function getEnvMap<T>(key: string, mapper: (s: string) => T): T | undefined {
  const value = Deno.env.get(key);
  if (value) {
    return mapper(value);
  }

  return undefined;
}

function getEnvOrDefault(
  key: string,
  defaultValue?: string
): string | undefined {
  const value = Deno.env.get(key);
  if (value == null) {
    return defaultValue;
  }

  return value;
}
