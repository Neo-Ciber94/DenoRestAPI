import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { connect } from "https://deno.land/x/redis@v0.25.5/mod.ts";
import { DeepPartial } from "../types/deep-partial.ts";
import { Assert } from "../utils/assert.ts";
import { ApiService } from "./base.service.ts";
import { Entity } from "../types/entity.ts";

const REDIS_HOST = Deno.env.get("REDIS_HOST");
const REDIS_PORT = Deno.env.get("REDIS_PORT");

Assert.nonNull(REDIS_HOST, "REDIS_HOST is not defined");
Assert.nonNull(REDIS_PORT, "REDIS_PORT is not defined");

const redis = await connect({
  hostname: REDIS_HOST,
  port: Number(REDIS_PORT),
});

export class RedisApiService<T extends Entity<string>>
  implements ApiService<T, string>
{
  constructor(readonly baseKey: string) {}

  get client() {
    return redis;
  }

  private keyFor(key: string): string {
    return `${this.baseKey}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const result = await redis.get(this.keyFor(key));
    if (result == null) {
      return undefined;
    }

    return JSON.parse(result) as T;
  }

  async getAll(): Promise<T[]> {
    const [_, ids] = await redis.scan(0, {
      pattern: `${this.baseKey}:*`,
    });

    const result: T[] = [];

    for (const id of ids) {
      const json = await redis.get(id);
      if (json != null) {
        const value = JSON.parse(json) as T;
        result.push(value);
      }
    }

    return result;
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const id = crypto.randomUUID();
    const newEntity: T = { id, ...entity } as T;
    const result = await redis.set(this.keyFor(id), JSON.stringify(newEntity));
    return newEntity;
  }

  async update(
    entity: DeepPartial<T> & { id: string }
  ): Promise<T | undefined> {
    const entityToUpdate = await this.get(entity.id);
    if (entityToUpdate == null) {
      return undefined;
    }

    const newEntity = { ...entity, ...entityToUpdate } as T;
    const result = await redis.set(entity.id, JSON.stringify(newEntity));

    if (result !== "OK") {
      return undefined;
    }

    return newEntity;
  }

  async delete(entity: string): Promise<T | undefined> {
    const entityToDelete = await this.get(entity);
    if (entityToDelete == null) {
      return undefined;
    }

    const result = await redis.del(this.keyFor(entity));
    if (result !== 1) {
      return undefined;
    }

    return entityToDelete;
  }
}
