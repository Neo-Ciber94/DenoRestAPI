import logger from "./common/logger.ts";
import { Application } from "oak";
import logging from "./middlewares/logging.middleware.ts";
import errorHandler from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";
import authRouter from "./routes/auth/auth.route.ts";
import { Config } from "./config/mod.ts";
import { createWorkerService } from "./utils/service-workers.ts";
import { ratelimiter } from "./middlewares/ratelimiter.middleware.ts";

// prettier-ignore
await createWorkerService("./workers/email-sender.worker.ts", import.meta.url);
logger.debug("Email sender service worker started...");

const port = Config.PORT || 8000;
const app = new Application();

app.use(logging());
app.use(ratelimiter());
app.use(errorHandler());

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
