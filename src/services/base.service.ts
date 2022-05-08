import { DeepPartial } from "../types/deep-partial.ts";
import { Entity } from "../types/entity.ts";

export interface ReadOnlyApiService<T extends Entity<TKey>, TKey = number> {
  get(key: TKey): Promise<T | undefined>;
  getAll(): Promise<T[]>;
}

export interface ApiService<
  T extends Entity<TKey>,
  TKey = number,
  TCreate = T,
  TUpdate = T,
  TDelete = TKey
> extends ReadOnlyApiService<T, TKey> {
  create(entity: DeepPartial<TCreate>): Promise<T>;
  update(entity: DeepPartial<TUpdate> & { id: TKey }): Promise<T | undefined>;
  delete(entity: TDelete): Promise<T | undefined>;
}
