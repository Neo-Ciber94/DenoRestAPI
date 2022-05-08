import logger from "./config/logger.ts";
import { Application } from "oak";
import loggerMiddleware from "./middlewares/logger.middleware.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";
import authRouter from "./routes/auth/auth.route.ts";
import { Config } from "./config/mod.ts";

const port = Number(Deno.env.get("PORT")) || 8000;
const app = new Application();

app.use(loggerMiddleware);
app.use(errorMiddleware);

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
