import * as log from "https://deno.land/std@0.138.0/log/mod.ts";
import { Application } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import loggerMiddleware from "./middlewares/logger.middleware.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";
import taskRouter from "./routes/tasks/task.route.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
    file: new log.handlers.RotatingFileHandler("WARNING", {
      filename: "./logs.txt",
      maxBackupCount: 12,
      maxBytes: 800000,
    }),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console", "file"],
    },
  },
});

const port = Number(Deno.env.get("PORT")) || 8000;
const app = new Application();

app.use(errorMiddleware);
app.use(loggerMiddleware);
app.use(taskRouter.routes());
app.use(taskRouter.allowedMethods());

app.addEventListener("listen", () => {
  log.info(`Listening on port ${port}`);
});

await app.listen({ port });
