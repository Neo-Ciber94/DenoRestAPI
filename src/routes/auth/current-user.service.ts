import { Config } from "../../config/mod.ts";
import { TokenService } from "../../services/token.service.ts";
import { User } from "./auth.model.ts";
import { UserService } from "./user.service.ts";
import { Request as OakRequest } from "oak";

export interface UserPayload {
  id: string;
  username: string;
  roles: string[];
}

export class CurrentUserService {
  private readonly tokenService = new TokenService<UserPayload>();
  private readonly userService = new UserService();

  constructor(private request: OakRequest) {}

  async loadUser(): Promise<User | undefined> {
    const payload = await this.getUserPayload();
    return payload ? this.userService.get(payload.id) : undefined;
  }

  async getId(): Promise<string | undefined> {
    const payload = await this.getUserPayload();
    return payload?.id;
  }

  async getRoles(): Promise<string[]> {
    const payload = await this.getUserPayload();
    return payload?.roles ?? [];
  }

  async getToken(): Promise<string | undefined> {
    const payload = await this.getUserPayloadAndToken();
    return payload?.token;
  }

  async getUserPayload(): Promise<UserPayload | undefined> {
    const payload = await this.getUserPayloadAndToken();

    if (payload == null) {
      return undefined;
    }

    return {
      id: payload.id,
      username: payload.username,
      roles: payload.roles,
    };
  }

  async getUserPayloadAndToken(): Promise<
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
