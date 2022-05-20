import { connect, Redis } from "redis";
import { Config } from "../config/mod.ts";

export const redisInstance = await connectToRedis();

/**
 * Creates a new redis instance.
 * @returns A new redis client instance.
 */
export function connectToRedis(): Promise<Redis> {
  return connect({
    hostname: Config.REDIS_HOST,
    port: Config.REDIS_PORT,
    password: Config.REDIS_PASSWORD,
  });
}
