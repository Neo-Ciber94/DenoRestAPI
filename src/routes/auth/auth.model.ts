import { Auditable } from "../../types/auditable.ts";
import { Entity } from "../../types/entity.ts";
import { PickRequired } from "../../types/pick-required.ts";
import { Permission } from "./permissions.ts";

export interface User extends Entity<string>, Auditable {
  username: string;
  email: string;
  passwordHash: string;
  parentUserId?: string;
  permissions: Permission[];
  isLocked: boolean;
  isEmailConfirmed?: boolean;
}

export type UserProfile = Pick<User, "username" | "id" | "permissions">;

export interface UserCreate {
  username: string;
  email: string;
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

export interface ChildUserCreate {
  username: string;
  email: string;
  password: string;
  permissions: Permission[];
}

export interface SetChildUserAccount {
  childId: string;
  newPassword: string;
}

export type ChildUserProfile = Omit<User, "passwordHash"> &
  PickRequired<User, "parentUserId">;

export interface ChildUserUpdate {
  childId: string;
  username?: string;
  permissions?: Permission[];
}
