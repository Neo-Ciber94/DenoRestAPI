import { PasswordHasher } from "../../services/password-hasher.service.ts";
import { ApplicationError } from "../../errors/app.error.ts";
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

  async createUser(userCreate: UserCreate): Promise<UserProfile> {
    const passwordHash = await this.hasher.hash(userCreate.password);
    const result = await this.userService.create({
      username: userCreate.username,
      passwordHash,
    });

    return {
      id: result.id,
      username: result.username,
    };
  }

  async login(userLogin: UserLogin): Promise<UserToken> {
    const ERROR_MESSAGE = "Invalid username or password";
    const user = await this.userService.getByUserName(userLogin.username);

    if (user == null) {
      ApplicationError.throwBadRequest(ERROR_MESSAGE);
    }

    const isValid = await this.hasher.verity(
      userLogin.password,
      user.passwordHash
    );

    if (!isValid) {
      ApplicationError.throwBadRequest(ERROR_MESSAGE);
    }
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
