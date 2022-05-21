import logger from "./config/logger.ts";
import { Application } from "oak";
import loggerMiddleware from "./middlewares/logger.middleware.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";
import authRouter from "./routes/auth/auth.route.ts";
import { Config } from "./config/mod.ts";
import { RedisMessagePublisher } from "./services/redis-pubsub.service.ts";
import {
  SendEmailMessage,
  SEND_EMAIL_MESSAGE_CHANNEL,
} from "./workers/email-sender.worker.ts";
import { createWorkerServiceAndWait } from "./utils/service-workers.ts";

// prettier-ignore
await createWorkerServiceAndWait("./workers/email-sender.worker.ts", import.meta.url);
logger.debug("Email sender service worker started...");

const errorPublisher = new RedisMessagePublisher<SendEmailMessage>({
  channel: SEND_EMAIL_MESSAGE_CHANNEL,
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
    const { status } = response;

    await errorPublisher.publish({
      to: "boniyeh816@dufeed.com",
      subject: `${method} ${url}`,
      content: `Error ${status} on ${method}: ${url}`,
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
  logger.debug(`Listening on port ${port}`);
  logger.debug(`Running on ${Config.ENVIRONMENT} mode`);
});

await app.listen({ port });
