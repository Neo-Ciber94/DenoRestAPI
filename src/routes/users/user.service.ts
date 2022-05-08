import { ReadOnlyApiService } from "../../services/base.service.ts";
import { RedisApiService } from "../../services/redis.service.ts";
import { User } from "../auth/user.model.ts";

export class UserService implements ReadOnlyApiService<User, string> {
  private readonly service = new RedisApiService<User>("users");

  get(key: string): Promise<User | undefined> {
    return this.service.get(key);
  }
  
  getAll(): Promise<User[]> {
    return this.service.getAll();
  }
}
