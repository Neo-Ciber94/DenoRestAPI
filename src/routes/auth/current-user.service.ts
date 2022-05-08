import { Config } from "../../config/mod.ts";
import { TokenService } from "../../services/token.service.ts";
import { User } from "./user.model.ts";
import { UserService } from "./user.service.ts";
import { Request as OakRequest } from "https://deno.land/x/oak@v10.5.1/request.ts";

export interface UserPayload {
  id: string;
  username: string;
}

export class CurrentUserService {
  private readonly tokenService = new TokenService<UserPayload>();
  private readonly userService = new UserService();

  constructor(private request: OakRequest) {}

  async loadUser(): Promise<User | undefined> {
    const payload = await this.getUserPayload();
    return payload ? this.userService.get(payload.id) : undefined;
  }

  async getUserPayload(): Promise<UserPayload | undefined> {
    const payload = await this.getUserPayloadAndUser();
    return payload ? { id: payload.id, username: payload.username } : undefined;
  }

  async getId(): Promise<string | undefined> {
    const payload = await this.getUserPayloadAndUser();
    return payload?.id;
  }

  async getToken(): Promise<string | undefined> {
    const payload = await this.getUserPayloadAndUser();
    return payload?.token;
  }

  async getUserPayloadAndUser(): Promise<
    (UserPayload & { token: string }) | undefined
  > {
    const authorization = this.request.headers.get("Authorization");

    if (authorization == null) {
      return undefined;
    }

    const token = authorization.replace("Bearer ", "");
    const payload = await this.tokenService.verify(token, Config.TOKEN_SECRET);

    if (payload == null) {
      return undefined;
    }

    return {
      ...payload,
      token,
    };
  }
}
