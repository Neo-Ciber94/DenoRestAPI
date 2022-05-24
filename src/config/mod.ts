import "dotenv/load";
import { Assert } from "../utils/assert.ts";

export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

// prettier-ignore
export namespace Config {
  export const ENVIRONMENT = getEnvOrDefault("ENVIRONMENT", Environment.DEVELOPMENT);
  export const API_URL = getEnvOrDefault("API_URL", "/api");
  export const PORT = getEnvMap("PORT", Number);
  export const CONSOLE_LOG_ERRORS = getEnvOrDefault("CONSOLE_LOG_ERRORS", "false") === "true";
  export const REDIS_HOST = getEnvOrThrow("REDIS_HOST");
  export const REDIS_PORT = getEnvOrThrow("REDIS_PORT");
  export const REDIS_PASSWORD = getEnvOrThrow("REDIS_PASSWORD");
  export const TOKEN_SECRET = getEnvOrThrow("TOKEN_SECRET");
  export const TOKEN_EXPIRES_MS = Number(getEnvOrThrow("TOKEN_EXPIRES_MS"));
  export const EMAIL_HOSTNAME = getEnvOrThrow("EMAIL_HOSTNAME");
  export const EMAIL_PORT = getEnvMap("EMAIL_PORT", Number);
  export const EMAIL_USERNAME = getEnvOrThrow("EMAIL_USERNAME");
  export const EMAIL_PASSWORD = getEnvOrThrow("EMAIL_PASSWORD");
  export const CONFIRM_EMAIL_PATHNAME = "confirm-email";
  export const CONFIRMATION_EMAIL_TOKEN_EXPIRES_SECS = getEnvMapOrThrow("CONFIRMATION_EMAIL_TOKEN_EXPIRES_SECS", Number);

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

function getEnvMapOrThrow<T>(key: string, mapper: (s: string) => T): T {
  const value = Deno.env.get(key);
  Assert.nonNull(value, `${key} is not defined`);
  return mapper(value);
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
