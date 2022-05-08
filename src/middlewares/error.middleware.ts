import { Middleware } from "oak";
import { Config } from "../config/mod.ts";
import { ApplicationError } from "../errors/app.error.ts";
import getStatusCodeMessage from "../utils/getStatusCodeMessage.ts";

const errorMiddleware: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // Custom exceptions
    if (err instanceof ApplicationError) {
      ctx.response.status = err.statusCode;
      ctx.response.body = {
        message: err.message ||
          getStatusCodeMessage(err.statusCode) ||
          "An error occurred",
      };
    } // This exceptions can only be exposed in development mode
    else if (Config.isDevelopment()) {
      ctx.response.status = err.status || err.statusCode || 500;
      ctx.response.body = {
        message: err.message || "An error occurred",
      };
    } // Fallback to 500
    else {
      ctx.response.status = 500;
      ctx.response.body = { message: "An error occurred" };
    }

    if (Config.CONSOLE_LOG_ERRORS) {
      console.error(err);
    }
  }
};

export default errorMiddleware;
