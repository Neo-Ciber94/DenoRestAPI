import { Middleware } from "oak";
import { CurrentUserService } from "../routes/auth/current-user.service.ts";

function authorize(): Middleware {
  return async (ctx, next) => {
    const currentUserService = new CurrentUserService(ctx.request);
    const user = await currentUserService.getUserPayloadAndUser();

    if (user == null) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    await next();
  };
}

export default authorize;
