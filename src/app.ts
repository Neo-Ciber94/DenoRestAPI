import logger from "./config/logger.ts";
import { Application } from "oak";
import loggerMiddleware from "./middlewares/logger.middleware.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";
import authRouter from "./routes/auth/auth.route.ts";
import { Config } from "./config/mod.ts";
import { WorkerDispatcher } from "./services/worker.service.ts";
import { EmailSenderKey, SendEmail } from "./worker/email-sender.worker.ts";

export const emailWorker = new WorkerDispatcher<EmailSenderKey, SendEmail>(
  new URL("./worker/email-sender.worker.ts", import.meta.url)
);

const port = Config.PORT || 8000;
const app = new Application();

app.use(loggerMiddleware);
app.use(errorMiddleware);

app.use(async (ctx, next) => {
  const { request, response } = ctx;

  if (response.status >= 400) {
    emailWorker.dispatch({
      type: "send_email",
      data: {
        to: "sovos79205@roxoas.com",
        subject: `An error ${response.status} occurred`,
        content: `${request.method} ${
          request.url
        } - ${new Date().toUTCString()} - ${String(
          response.body?.valueOf() || ""
        )}`,
      },
    });
  }

  await next();
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
