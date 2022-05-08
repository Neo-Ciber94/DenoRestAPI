import {
  UserChangePassword,
  UserCreate,
  UserLogin,
  UserProfile,
  UserToken,
} from "./user.model.ts";

export class AuthService {
  createUser(userCreate: UserCreate): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  login(userLogin: UserLogin): Promise<UserToken> {
    throw new Error("Method not implemented.");
  }

  logout(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  me(): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  changePassword(userChangePassword: UserChangePassword): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
