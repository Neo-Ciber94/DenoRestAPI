import { Auditable } from "../../types/auditable.ts";
import { Entity } from "../../types/entity.ts";
import { Permission } from "./permissions.ts";

export interface User extends Entity<string>, Auditable {
  username: string;
  passwordHash: string;
  parentUserId?: string;
  permissions: Permission[];
}

export type UserProfile = Pick<User, "username" | "id" | "permissions">;

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserToken {
  token: string;
  expiration: Date;
}

export interface UserChangePassword {
  oldPassword: string;
  newPassword: string;
}
