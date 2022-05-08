import { Config } from "../../config/mod.ts";
import { TokenService } from "../../services/token.service.ts";
import { User } from "./auth.model.ts";
import { UserService } from "./user.service.ts";
import { Request as OakRequest } from "oak";
import { Permission } from "./permissions.ts";

export interface UserPayload {
  id: string;
  username: string;
  permissions: Permission[];
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

  async getPermissions(): Promise<string[]> {
    const payload = await this.getUserPayload();
    return payload?.permissions ?? [];
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
      permissions: payload.permissions,
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
