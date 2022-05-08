import { Auditable } from "../../types/auditable.ts";
import { Entity } from "../../types/entity.ts";

export interface User extends Entity<string>, Auditable {
  username: string;
  passwordHash: string;
}

export type UserProfile = Pick<
  User,
  "username" | "id" | "creationDate" | "lastUpdateDate"
>;

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserToken {
  accessToken: string;
  expiration: Date;
}

export interface UserChangePassword {
  oldPassword: string;
  newPassword: string;
}
