import log from "../config/logger.ts";
import { Middleware } from "oak";

const logger = log.getLogger();

const loggerMiddleware: Middleware = async (ctx, next) => {
  let responseTime = 0;

  try {
    const startTime = Date.now();
    await next();
    const endTime = Date.now();

    responseTime = endTime - startTime;
  } finally {
    const req = ctx.request;
    const pathName = req.url.pathname;
    const agent = req.headers.get("user-agent");
    const statusCode = ctx.response.status;
    const msg = `[${req.method}] ${statusCode} - ${req.ip} - ${pathName} - ${responseTime}ms - ${agent}`;

    if (statusCode >= 500) {
      logger.error(msg);
    } else if (statusCode >= 400) {
      logger.warning(msg);
    } else {
      logger.info(msg);
    }
  }
};

export default loggerMiddleware;
