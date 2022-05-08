import { redisInstance } from "../../services/redis.service.ts";

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

  async exists(userId: string, token: string): Promise<boolean> {
    const key = keyFor(userId, token);
    const result = await redis.get(key);
    return result != null;
  }
}
