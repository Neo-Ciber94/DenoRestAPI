import { PasswordHasher } from "../../services/password-hasher.service.ts";
import { UserService } from "../users/user.service.ts";
import {
  UserChangePassword,
  UserCreate,
  UserLogin,
  UserProfile,
  UserToken,
} from "./user.model.ts";

export class AuthService {
  private readonly userService = new UserService();
  private readonly hasher = new PasswordHasher();

  createUser(userCreate: UserCreate): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  login(userLogin: UserLogin, response: Response): Promise<UserToken> {
    throw new Error("Method not implemented.");
  }

  logout(response: Response): Promise<void> {
    throw new Error("Method not implemented.");
  }

  me(): Promise<UserProfile> {
    throw new Error("Method not implemented.");
  }

  changePassword(userChangePassword: UserChangePassword): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
