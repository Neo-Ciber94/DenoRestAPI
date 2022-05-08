import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { Assert } from "../utils/assert.ts";

export module Config {
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
