import { ApplicationError } from "../../errors/app.error.ts";
import { ApiService } from "../../services/interfaces/api.service.ts";
import { RedisApiService } from "../../services/redis.service.ts";
import { DeepPartial } from "../../types/deep-partial.ts";
import { User } from "./auth.model.ts";

type CreateNewUser = DeepPartial<User> & {
  username: string;
  email: string;
  password: string;
};

export class UserService implements ApiService<User, string, CreateNewUser> {
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

  async getByEmail(email: string): Promise<User | undefined> {
    const users = await this.getAll();
    return users.find((u) => u.email == email);
  }

  async create(entity: CreateNewUser): Promise<User> {
    await this.throwIfDuplicatedUsername(entity.username);
    await this.throwIfDuplicatedEmail(entity.email);

    const newUser: DeepPartial<User> = {
      username: entity.username,
      passwordHash: entity.password,
      creationDate: new Date(),
      parentUserId: entity.parentUserId,
      permissions: entity.permissions,
    };
    return this.service.create(newUser);
  }

  async update(
    entity: DeepPartial<User> & { id: string }
  ): Promise<User | undefined> {
    if (entity.username) {
      await this.throwIfDuplicatedUsername(entity.username);
    }

    entity.lastUpdateDate = new Date();
    return this.service.update(entity);
  }

  delete(entity: string): Promise<User | undefined> {
    return this.service.delete(entity);
  }

  private async throwIfDuplicatedUsername(username: string): Promise<void> {
    const user = await this.getByUserName(username);
    if (user != null) {
      ApplicationError.throwBadRequest(`Username '${username}' already exists`);
    }
  }

  private async throwIfDuplicatedEmail(email: string): Promise<void> {
    const user = await this.getByEmail(email);
    if (user != null) {
      ApplicationError.throwBadRequest(`Email '${email}' already exists`);
    }
  }
}
