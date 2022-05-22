import { connect, Redis } from "redis";
import { Config } from "../config/mod.ts";

/**
 * The shared redis client instance.
 */
export const redisInstance = await connectToRedis();

/**
 * Perform a full scan using the given pattern.
 * @param redis The redis instance to perform a full scan on.
 * @param pattern An async iterator that return the matched keys.
 */
export async function* fullScan(
  redis: Redis,
  pattern: string
): AsyncGenerator<string> {
  let cursor = 0;

  do {
    const [currentCursor, keys] = await redis.scan(cursor, {
      pattern,
    });

    for (const k of keys) {
      yield k;
    }

    cursor = Number(currentCursor);
  } while (cursor > 0 && !Number.isNaN(cursor));
}

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
