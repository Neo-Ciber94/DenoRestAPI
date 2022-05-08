import { ApplicationError } from "../../errors/app.error.ts";
import { ApiService } from "../../services/base.service.ts";
import { RedisApiService } from "../../services/redis.service.ts";
import { DeepPartial } from "../../types/deep-partial.ts";
import { User, UserCreate } from "../auth/user.model.ts";

export class UserService implements ApiService<User, string, UserCreate> {
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

  async create(entity: UserCreate): Promise<User> {
    await this.throwIfExist(entity.username);

    const newUser: DeepPartial<User> = {
      username: entity.username,
      passwordHash: entity.password,
      creationDate: new Date(),
    };
    return this.service.create(newUser);
  }

  async update(
    entity: DeepPartial<User> & { id: string }
  ): Promise<User | undefined> {
    if (entity.username) {
      await this.throwIfExist(entity.username);
    }

    entity.lastUpdateDate = new Date();
    return this.service.update(entity);
  }

  delete(entity: string): Promise<User | undefined> {
    return this.service.delete(entity);
  }

  private async throwIfExist(username: string): Promise<void> {
    const user = await this.getByUserName(username);
    if (user != null) {
      ApplicationError.throwBadRequest(`User ${username} already exists`);
    }
  }
}
