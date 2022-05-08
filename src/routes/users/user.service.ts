import { ApiService, ReadOnlyApiService } from "../../services/base.service.ts";
import { RedisApiService } from "../../services/redis.service.ts";
import { DeepPartial } from "../../types/deep-partial.ts";
import { User } from "../auth/user.model.ts";

export class UserService implements ApiService<User, string> {
  private readonly service = new RedisApiService<User>("users");

  get(key: string): Promise<User | undefined> {
    return this.service.get(key);
  }

  getAll(): Promise<User[]> {
    return this.service.getAll();
  }

  async getByUserName(username: string): Promise<User | undefined> {
    const users = await this.getAll();
    return users.find((u) => u.username == username);
  }

  create(entity: DeepPartial<User>): Promise<User> {
    entity.creationDate = new Date();
    return this.service.create(entity);
  }

  update(
    entity: DeepPartial<User> & { id: string }
  ): Promise<User | undefined> {
    entity.lastUpdateDate = new Date();
    return this.service.update(entity);
  }

  delete(entity: string): Promise<User | undefined> {
    return this.service.delete(entity);
  }
}
