import { connect } from "redis";
import { DeepPartial } from "../types/deep-partial.ts";
import { ApiService } from "./interfaces/api.service.ts";
import { Entity } from "../types/entity.ts";
import { ApplicationError } from "../errors/app.error.ts";
import { Config } from "../config/mod.ts";

export const redisInstance = await connect({
  hostname: Config.REDIS_HOST,
  port: Config.REDIS_PORT,
  password: Config.REDIS_PASSWORD
});

export class RedisApiService<T extends Entity<string>>
  implements ApiService<T, string>
{
  constructor(readonly baseKey: string) {}

  get client() {
    return redisInstance;
  }

  private keyFor(key: string): string {
    return `${this.baseKey}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const result = await redisInstance.get(this.keyFor(key));
    if (result == null) {
      return undefined;
    }

    return JSON.parse(result) as T;
  }

  async getAll(): Promise<T[]> {
    const result: T[] = [];
    let cursor = 0;

    do {
      const [newCursor, ids] = await redisInstance.scan(cursor, {
        pattern: `${this.baseKey}:*`,
      });

      cursor = Number(newCursor);

      for (const id of ids) {
        const json = await redisInstance.get(id);

        if (json != null) {
          const value = JSON.parse(json) as T;
          result.push(value);
        }
      }
    } while (cursor != 0 && !isNaN(cursor));

    return result;
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const id = crypto.randomUUID();
    const newEntity: T = { id, ...entity } as T;
    const result = await redisInstance.set(
      this.keyFor(id),
      JSON.stringify(newEntity)
    );

    if (result !== "OK") {
      ApplicationError.internalServerError();
    }

    return newEntity;
  }

  async update(
    entity: DeepPartial<T> & { id: string }
  ): Promise<T | undefined> {
    const entityToUpdate = await this.get(entity.id);
    if (entityToUpdate == null) {
      return undefined;
    }

    const newEntity = Object.assign({}, entityToUpdate) as T;

    for (const [key, value] of Object.entries(entity)) {
      if (key === "id") {
        continue;
      }

      if (value) {
        (newEntity as any)[key] = value;
      }
    }

    const result = await redisInstance.set(
      this.keyFor(entity.id),
      JSON.stringify(newEntity)
    );

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

    const result = await redisInstance.del(this.keyFor(entity));
    if (result !== 1) {
      return undefined;
    }

    return entityToDelete;
  }
}
