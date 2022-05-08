import { Middleware } from "https://deno.land/x/oak@v10.5.1/middleware.ts";
import { CurrentUserService } from "../routes/auth/current-user.service.ts";

function authorize(): Middleware {
  return async (ctx, next) => {
    const currentUserService = new CurrentUserService(ctx.request);

    if ((await currentUserService.getUserPayloadAndUser()) == null) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    await next();
  };
}

export default authorize;
