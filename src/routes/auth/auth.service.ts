import { PasswordHasher } from "../../services/password-hasher.service.ts";
import { TokenService } from "../../services/token.service.ts";
import { ApplicationError } from "../../errors/app.error.ts";
import { LoggedUserService } from "./logged-user.service.ts";
import { UserService } from "./user.service.ts";
import {
  ChildUserCreate,
  ChildUserProfile,
  ChildUserUpdate,
  SetChildUserAccount,
  User,
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
  childUserCreateValidator,
  childUserSetPasswordValidator,
  childUserUpdateValidator,
  userChangePasswordValidator,
  userCreateValidator,
  userLoginValidator,
} from "./auth.validator.ts";
import { getAllPermissions, Permission } from "./permissions.ts";

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

  async createChildUserAccount(
    childAccountCreate: ChildUserCreate
  ): Promise<ChildUserProfile> {
    const [error, _] = childUserCreateValidator(childAccountCreate);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const parentUser = await this.currentUserService.loadUser();

    if (parentUser == null) {
      ApplicationError.throwBadRequest(`Cannot find parent user account`);
    }

    if (parentUser.parentUserId != null) {
      ApplicationError.throwBadRequest(
        `Only parent user accounts can create child user accounts`
      );
    }

    const passwordHash = await this.hasher.hash(childAccountCreate.password);
    const permissions = Array.from(
      new Set<Permission>(childAccountCreate.permissions)
    );

    const result = await this.userService.create({
      ...childAccountCreate,
      password: passwordHash,
      parentUserId: parentUser.id,
      permissions,
    });

    return {
      id: result.id,
      creationDate: result.creationDate,
      username: result.username,
      permissions: result.permissions,
      lastUpdateDate: result.lastUpdateDate,
      parentUserId: result.parentUserId!,
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
      user.passwordHash
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
      user.passwordHash
    );

    if (!isValid) {
      ApplicationError.throwBadRequest(ERROR_INVALID_CREDENTIALS);
    }

    const passwordHash = await this.hasher.hash(userChangePassword.newPassword);
    user.passwordHash = passwordHash;
    await this.userService.update(user);
  }

  async setChildUserPassword(
    setChildUserPassword: SetChildUserAccount
  ): Promise<void> {
    const [error, _] = childUserSetPasswordValidator(setChildUserPassword);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const user = await this.currentUserService.loadUser();

    if (user == null || user.parentUserId == null) {
      ApplicationError.throwForbidden();
    }

    const childUser = await this.userService.get(setChildUserPassword.childId);

    if (childUser == null || childUser.parentUserId != user.id) {
      ApplicationError.throwNotFound("Child user not found");
    }

    const passwordHash = await this.hasher.hash(
      setChildUserPassword.newPassword
    );
    childUser.passwordHash = passwordHash;
    await this.userService.update({
      id: childUser.id,
      passwordHash,
    });
  }

  async updateChildUser(
    childUserUpdate: ChildUserUpdate
  ): Promise<ChildUserProfile | undefined> {
    const [error, _] = childUserUpdateValidator(childUserUpdate);

    if (error) {
      ApplicationError.throwBadRequest(error.message);
    }

    const user = await this.currentUserService.loadUser();

    if (user == null || user.parentUserId == null) {
      ApplicationError.throwForbidden();
    }

    const childUser = await this.userService.get(childUserUpdate.childId);

    if (childUser == null) {
      ApplicationError.throwNotFound("Child user not found");
    }

    if (childUser.parentUserId != user.id) {
      ApplicationError.throwForbidden();
    }

    const permissions = childUserUpdate.permissions
      ? Array.from(new Set(childUserUpdate.permissions))
      : undefined;

    const result = await this.userService.update({
      id: childUser.id,
      username: childUserUpdate.username,
      permissions,
    });

    if (result == null) {
      return undefined;
    }

    return {
      id: result.id,
      username: result.username,
      permissions: result.permissions,
      parentUserId: result.parentUserId,
      creationDate: result.creationDate,
      lastUpdateDate: result.lastUpdateDate,
    };
  }

  async getChildUsersAccounts(): Promise<ChildUserProfile[]> {
    const user = await this.currentUserService.loadUser();

    if (user == null) {
      ApplicationError.throwUnauthorized();
    }

    if (user.parentUserId == null) {
      ApplicationError.throwForbidden();
    }

    const childUsers = await this.userService
      .getAll()
      .then((u) => u.filter((u) => u.parentUserId === user.id));

    return childUsers.map((u) => ({
      id: u.id,
      creationDate: u.creationDate,
      username: u.username,
      permissions: u.permissions,
      lastUpdateDate: u.lastUpdateDate,
      parentUserId: u.id,
    }));
  }

  getChildUserAccountById(
    childId: string
  ): Promise<ChildUserProfile | undefined> {
    return this.getChildUsersAccounts().then((users) =>
      users.find((u) => u.id === childId)
    );
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
