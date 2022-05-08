import { Middleware } from "oak";
import { Config } from "../config/mod.ts";
import { ApplicationError } from "../errors/app.error.ts";
import getStatusCodeMessage from "../utils/getStatusCodeMessage.ts";

const errorMiddleware: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ApplicationError) {
      ctx.response.status = err.statusCode;
      ctx.response.body = {
        message:
          err.message ||
          getStatusCodeMessage(err.statusCode) ||
          "An error occurred",
      };
    } else {
      ctx.response.status = err.status || err.statusCode || 500;
      ctx.response.body = {
        message: err.message || "An error occurred",
      };
    }

    if (Config.CONSOLE_LOG_ERRORS) {
      console.error(err);
    }
  }
};

export default errorMiddleware;
