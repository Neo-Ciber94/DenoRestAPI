import { Middleware, Request as OakRquest } from "oak";
import {
  CurrentUserService,
  UserPayload,
} from "../routes/auth/current-user.service.ts";

export type Pattern = string | RegExp;

export interface AllowList {
  allow?: Pattern[];
  deny?: Pattern[];
}

export interface AuthorizeOptions {
  permissions?: Pattern[] | AllowList[];
  ips?: Pattern[] | AllowList[];
}

// prettier-ignore
export type AuthorizeFn = (
  req: Readonly<OakRquest>,
) => Promise<boolean> | boolean;

function authorize(
  this: any,
  options?: AuthorizeOptions | AuthorizeFn,
): Middleware {
  return async (ctx, next) => {
    const currentUserService = new CurrentUserService(ctx.request);
    const userPayload = await currentUserService.getUserPayload();

    if (userPayload == null) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    if (options) {
      let authorizeFn: AuthorizeFn;

      if (typeof options === "function") {
        authorizeFn = options;
      } else {
        authorizeFn = optionsToAuthorizeFn(userPayload, options);
      }

      const isAuthorized = await authorizeFn(ctx.request);

      if (!isAuthorized) {
        ctx.response.status = 401;
        ctx.response.body = "Unauthorized";
        return;
      }
    }

    await next();
  };
}

// prettier-ignore
function optionsToAuthorizeFn(
  userPayload: UserPayload,
  options: AuthorizeOptions,
): AuthorizeFn {
  return (req) => {
    const { permissions, ips } = options;

    if (permissions && permissions.length > 0) {
      const allowedPermissions = getAllowListRegExp(permissions, "allow");
      const deniedPermissions = getAllowListRegExp(permissions, "deny");

      let isAllowed = false;
      let isDenied = false;

      for (const permission of userPayload.permissions) {
        if (allowedPermissions.some((e) => e.test(permission))) {
          isAllowed = true;
          break;
        }
      }

      for (const permission of userPayload.permissions) {
        if (deniedPermissions.some((e) => e.test(permission))) {
          isDenied = true;
          break;
        }
      }

      if (!isAllowed || isDenied) {
        return false;
      }
    }

    if (ips && ips.length > 0) {
      const allowedIps = getAllowListRegExp(ips, "allow");
      const deniedIps = getAllowListRegExp(ips, "deny");

      const isAllowed = allowedIps.some((e) => e.test(req.ip));
      if (!isAllowed) {
        return false;
      }

      const isDenied = deniedIps.some((e) => e.test(req.ip));
      if (isDenied) {
        return false;
      }
    }

    return true;
  };
}

function getAllowListRegExp(
  values: Pattern[] | AllowList[],
  kind: keyof AllowList,
): RegExp[] {
  return values
    .flatMap(patternToAllowList)
    .filter((e) => e != null)
    .flatMap((e) => e[kind] as Pattern[])
    .filter((e) => e != null)
    .map(patternToRegex);
}

function patternToAllowList(value: Pattern | AllowList): AllowList {
  if (typeof value === "string") {
    return {
      allow: [value],
    };
  }

  if (value instanceof RegExp) {
    return {
      allow: [value],
    };
  }

  return value;
}

function patternToRegex(pattern: Pattern): RegExp {
  if (typeof pattern === "string") {
    return new RegExp(escapeRegExp(pattern));
  }

  return pattern;
}

function escapeRegExp(s: string) {
  //  https://stackoverflow.com/a/6969486
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export default authorize;
