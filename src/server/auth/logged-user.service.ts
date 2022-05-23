import { redisInstance } from "../../database/redis.ts";

const redis = redisInstance;
const KEY = "logged_user";

function keyFor(key: string, token: string): string {
  return `${KEY}:${key}:${token}`;
}

export class LoggedUserService {
  async add(userId: string, token: string, expiresInMs: number): Promise<void> {
    const expiresSeconds = Math.floor(expiresInMs / 1000);
    const key = keyFor(userId, token);
    await redis.setex(key, expiresSeconds, userId);
  }

  async remove(userId: string, token: string): Promise<boolean> {
    const key = keyFor(userId, token);
    const result = await redis.del(key);
    return result === 1;
  }

  // FIXME: Don't return a tuple
  async removeUser(userId: string): Promise<[number, number]> {
    const key = `${KEY}:${userId}`;
    const pattern = `${key}:*`;

    const [_, keys] = await redis.scan(0, {
      pattern,
    });

    const total = keys.length;
    let count = 0;

    for (const key of keys) {
      const result = await redis.del(key);

      if (result === 1) {
        count++;
      }
    }

    return [total, count];
  }

  async exists(userId: string, token: string): Promise<boolean> {
    const key = keyFor(userId, token);
    const result = await redis.get(key);
    return result != null;
  }
}
