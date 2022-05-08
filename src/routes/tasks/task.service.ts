import { Task } from "./task.model.ts";
import { ApiService } from "../../services/base.service.ts";
import { DeepPartial } from "../../types/deep-partial.ts";
import { RedisApiService } from "../../services/redis.service.ts";

export class TaskApiService implements ApiService<Task, string> {
  private readonly service = new RedisApiService<Task>("task");

  get(key: string): Promise<Task | undefined> {
    return this.service.get(key);
  }

  getAll(): Promise<Task[]> {
    return this.service.getAll();
  }

  create(entity: DeepPartial<Task>): Promise<Task> {
    entity.completed = false;
    entity.creationDate = new Date();
    return this.service.create(entity);
  }

  update(
    entity: DeepPartial<Task> & { id: string }
  ): Promise<Task | undefined> {
    return this.service.update(entity);
  }

  async toggle(id: string): Promise<Task | undefined> {
    const result = await this.service.get(id);

    if (result == null) {
      return undefined;
    }

    const newEntity = {
      id,
      completed: !result.completed,
      lastUpdateDate: new Date(),
    };

    return this.service.update(newEntity);
  }

  delete(entity: string): Promise<Task | undefined> {
    return this.service.delete(entity);
  }
}
