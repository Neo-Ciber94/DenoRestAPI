import { Middleware, Request as OakRquest } from "oak";
import {
  CurrentUserService,
  UserPayload,
} from "../routes/auth/current-user.service.ts";

export type Pattern = string | RegExp;

export interface AllowList {
  allow: Pattern[];
  deny: Pattern[];
}

export interface AuthorizeOptions {
  roles?: AllowList[];
  ips?: AllowList[];
}

export type AuthorizeFn = (
  req: Readonly<OakRquest>
) => Promise<boolean> | boolean;

function authorize(options?: AuthorizeOptions | AuthorizeFn): Middleware {
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

function optionsToAuthorizeFn(
  userPayload: UserPayload,
  options: AuthorizeOptions
): AuthorizeFn {
  return (req) => {
    const { roles, ips } = options;

    if (roles && roles.length > 0) {
      const allowedRoles = roles.flatMap((e) => e.allow).map(patternToRegex);
      const deniedRoles = roles.flatMap((e) => e.deny).map(patternToRegex);

      let isAllowed = false;
      let isDenied = false;

      for (const role of userPayload.roles) {
        if (allowedRoles.some((e) => e.test(role))) {
          isAllowed = true;
          break;
        }
      }

      for (const role of userPayload.roles) {
        if (deniedRoles.some((e) => e.test(role))) {
          isDenied = true;
          break;
        }
      }

      if (!isAllowed || isDenied) {
        return false;
      }
    }

    if (ips && ips.length > 0) {
      const allowedIps = ips.flatMap((e) => e.allow).map(patternToRegex);
      const deniedIps = ips.flatMap((e) => e.deny).map(patternToRegex);

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
