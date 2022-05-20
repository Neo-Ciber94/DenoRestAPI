import logger from "./config/logger.ts";
import { Application } from "oak";
import loggerMiddleware from "./middlewares/logger.middleware.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";
import authRouter from "./routes/auth/auth.route.ts";
import { Config } from "./config/mod.ts";
import { RedisMessagePublisher } from "./services/redis-pubsub.service.ts";
import { ErrorReport } from "./types/error-report.ts";
import { ERROR_EVENT_CHANNEL } from "./constants/mod.ts";

// WORKER
const worker = new Worker(
  new URL("./worker/email-sender.worker.ts", import.meta.url).href,
  {
    type: "module",
    deno: {
      namespace: true,
    },
  } as any
);

worker.onmessage = (message) => {
  if (message.type === "ready") {
    logger.debug("Worker ready");
  }
};

const errorPublisher = new RedisMessagePublisher<ErrorReport>({
  channel: ERROR_EVENT_CHANNEL,
});

const port = Config.PORT || 8000;
const app = new Application();

app.use(loggerMiddleware);
app.use(errorMiddleware);

app.use(async (ctx, next) => {
  await next();

  const { request, response } = ctx;

  if (response.status >= 400) {
    const { method, url } = request;
    await errorPublisher.publish({
      status: response.status,
      url: url.pathname,
      method,
    });
  }
});

// auth
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// tasks
app.use(taskRouter.routes());
app.use(taskRouter.allowedMethods());

app.addEventListener("listen", () => {
  logger.info(`Listening on port ${port}`);
  logger.info(`Running on ${Config.ENVIRONMENT} mode`);
});

await app.listen({ port });
