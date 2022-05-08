import { PasswordHasher } from "../../services/password-hasher.service.ts";
import { TokenService } from "../../services/token.service.ts";
import { ApplicationError } from "../../errors/app.error.ts";
import { LoggedUserService } from "./logged-user.service.ts";
import { UserService } from "./user.service.ts";
import {
  UserChangePassword,
  UserCreate,
  UserLogin,
  UserProfile,
  UserToken,
} from "./auth.model.ts";
import { Config } from "../../config/mod.ts";
import { CurrentUserService, UserPayload } from "./current-user.service.ts";
import { Request as OakRequest } from "oak";
import {
  userChangePasswordValidator,
  userCreateValidator,
  userLoginValidator,
} from "./auth.validator.ts";
import { getAllPermissions } from "./permissions.ts";

const ERROR_INVALID_CREDENTIALS = "Invalid username or password";

export class AuthService {
  private readonly userService = new UserService();
  private readonly hasher = new PasswordHasher();
  private readonly tokenService = new TokenService<UserPayload>();
  private readonly loggedUserService = new LoggedUserService();
  private readonly currentUserService: CurrentUserService;

  constructor(request: OakRequest) {
    this.currentUserService = new CurrentUserService(request);
  }

  async createUser(userCreate: UserCreate): Promise<UserProfile> {
    const [error, _] = userCreateValidator(userCreate);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const passwordHash = await this.hasher.hash(userCreate.password);
    const result = await this.userService.create({
      username: userCreate.username,
      password: passwordHash,
    });

    return {
      id: result.id,
      username: result.username,
      permissions: result.permissions,
    };
  }

  async login(userLogin: UserLogin): Promise<UserToken> {
    const [error, _] = userLoginValidator(userLogin);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const user = await this.userService.getByUserName(userLogin.username);

    if (user == null) {
      ApplicationError.throwBadRequest(ERROR_INVALID_CREDENTIALS);
    }

    const isValid = await this.hasher.verify(
      userLogin.password,
      user.passwordHash,
    );

    if (!isValid) {
      ApplicationError.throwBadRequest(ERROR_INVALID_CREDENTIALS);
    }

    const expirationMs = Config.TOKEN_EXPIRES_MS;
    const token = await this.tokenService.generate({
      expiresMs: expirationMs,
      secret: Config.TOKEN_SECRET,
      payload: {
        id: user.id,
        username: user.username,
        permissions: getAllPermissions(),
      },
    });

    await this.loggedUserService.add(user.id, token, expirationMs);

    return {
      token: token,
      expiration: new Date(Date.now() + expirationMs),
    };
  }

  async logout(): Promise<void> {
    const userPayload = await this.currentUserService.getUserPayloadAndToken();

    if (userPayload == null) {
      ApplicationError.throwUnauthorized();
    }

    const { id, token } = userPayload;

    // prettier-ignore
    if (!(await this.loggedUserService.remove(id, token))) {
      ApplicationError.throwUnauthorized();
    }
  }

  async me(): Promise<UserProfile> {
    const userId = await this.currentUserService.getId();

    if (userId == null) {
      ApplicationError.throwUnauthorized();
    }

    const user = await this.userService.get(userId);

    if (user == null) {
      ApplicationError.throwNotFound("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      permissions: user.permissions,
    };
  }

  async changePassword(userChangePassword: UserChangePassword): Promise<void> {
    const [error, _] = userChangePasswordValidator(userChangePassword);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const user = await this.currentUserService.loadUser();

    if (user == null) {
      ApplicationError.throwUnauthorized();
    }

    const isValid = await this.hasher.verify(
      userChangePassword.oldPassword,
      user.passwordHash,
    );

    if (!isValid) {
      ApplicationError.throwBadRequest(ERROR_INVALID_CREDENTIALS);
    }

    const passwordHash = await this.hasher.hash(userChangePassword.newPassword);
    user.passwordHash = passwordHash;
    await this.userService.update(user);
  }

  async refreshUsersPermissions() {
    const users = await this.userService.getAll();

    for (const user of users) {
      // Only update admin accounts
      if (user.parentUserId == null) {
        const permissions = getAllPermissions();
        await this.userService.update({
          id: user.id,
          permissions,
        });
      }
    }
  }
}
