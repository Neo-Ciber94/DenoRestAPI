import { Task } from "./task.model.ts";
import { ApiService } from "../../services/base.service.ts";
import { DeepPartial } from "../../types/deep-partial.ts";
import { RedisApiService } from "../../services/redis.service.ts";
import { ApplicationError } from "../../errors/app.error.ts";
import { taskCreateValidator, taskUpdateValidator } from "./task.validator.ts";
import { Request as OakRequest } from "oak";
import { CurrentUserService } from "../auth/current-user.service.ts";

export class TaskApiService implements ApiService<Task, string> {
  private readonly service = new RedisApiService<Task>("task");
  private readonly currentUserService: CurrentUserService;

  constructor(request: OakRequest) {
    this.currentUserService = new CurrentUserService(request);
  }

  async get(key: string): Promise<Task | undefined> {
    const result = await this.service.get(key);
    const userId = await this.currentUserService.getId();
    return result && result.createdByUser === userId ? result : undefined;
  }

  async getAll(): Promise<Task[]> {
    const result = await this.service.getAll();
    const userId = await this.currentUserService.getId();
    return result.filter((task) => task.createdByUser === userId);
  }

  async create(entity: DeepPartial<Task>): Promise<Task> {
    const [err, task] = taskCreateValidator(entity as any);

    if (err) {
      ApplicationError.throwBadRequest(err.message);
    }

    const userId = await this.currentUserService.getId();
    const newEntity: DeepPartial<Task> = {
      ...task!,
      completed: false,
      creationDate: new Date(),
      createdByUser: userId,
    };

    return this.service.create(newEntity);
  }

  async update(
    entity: DeepPartial<Task> & { id: string }
  ): Promise<Task | undefined> {
    const [err, task] = taskUpdateValidator(entity as any);

    if (err) {
      ApplicationError.throwBadRequest(err.message);
    }

    const userId = await this.currentUserService.getId();
    const newEntity: DeepPartial<Task> & { id: string } = {
      ...task!,
      lastUpdateDate: new Date(),
      lastUpdatedByUser: userId,
    };

    return this.service.update(newEntity);
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
