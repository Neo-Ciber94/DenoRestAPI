import * as log from "https://deno.land/std@0.138.0/log/mod.ts";
import { Middleware } from "https://deno.land/x/oak@v10.5.1/middleware.ts";

const logger = log.getLogger();

const loggerMiddleware: Middleware = async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const endTime = Date.now();

  const responseTime = endTime - startTime;
  const req = ctx.request;
  const agent = req.headers.get("user-agent");

  logger.info(
    "{method} {url}: {ip} {agent} {time}",
    req.ip,
    req.method,
    req.url,
    agent,
    responseTime
  );
};

export default loggerMiddleware;
