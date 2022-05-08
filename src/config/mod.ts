import "dotenv/load";
import { Assert } from "../utils/assert.ts";

export module Config {
  export const ENVIRONMENT = getEnvOrThrow("ENVIRONMENT");
  export const CONSOLE_LOG_ERRORS = getEnvOrThrow("CONSOLE_LOG_ERRORS") === "true";
  export const REDIS_HOST = getEnvOrThrow("REDIS_HOST");
  export const REDIS_PORT = getEnvOrThrow("REDIS_PORT");
  export const TOKEN_SECRET = getEnvOrThrow("TOKEN_SECRET");
  export const TOKEN_EXPIRES_MS = Number(getEnvOrThrow("TOKEN_EXPIRES_MS"));
}

function getEnvOrThrow(key: string): string {
  const value = Deno.env.get(key);
  Assert.nonNull(value, `${key} is not defined`);
  return value;
}
