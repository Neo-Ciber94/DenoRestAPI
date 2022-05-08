import { DeepPartial } from "../types/deep-partial.ts";
import { Entity } from "../types/entity.ts";

export interface ApiService<
  T extends Entity<TKey>,
  TKey = number,
  TCreate = T,
  TUpdate = T,
  TDelete = TKey
> {
  get(key: TKey): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  create(entity: DeepPartial<TCreate>): Promise<T>;
  update(entity: DeepPartial<TUpdate> & { id: TKey }): Promise<T | undefined>;
  delete(entity: TDelete): Promise<T | undefined>;
}
