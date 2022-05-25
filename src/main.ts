import logger from "./common/logger.ts";
import { Application } from "oak";
import logging from "./middlewares/logging.middleware.ts";
import errorHandler from "./middlewares/error.middleware.ts";
import { Config } from "./config/mod.ts";
import { createWorkerService } from "./utils/service-workers.ts";
import { ratelimiter } from "./middlewares/ratelimiter.middleware.ts";
import { brotli, deflate, gzip } from "compress";
import { oakCors as cors } from "cors";
import apiRouter from "./server/api.route.ts";
import { useServerSideRoutes } from "./ssr/mod.tsx";

// prettier-ignore
await createWorkerService("./workers/email-sender.worker.ts", import.meta.url);
logger.debug("Email sender service worker started...");

const port = Config.PORT || 8000;
const app = new Application();

// Middlewares
app.use(errorHandler());
app.use(cors());
app.use(logging());
app.use(ratelimiter());

// Compression
app.use(brotli());
app.use(gzip());
app.use(deflate());

// Routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Views
await useServerSideRoutes(app);

app.addEventListener("listen", () => {
  logger.debug(`Listening on port ${port}`);
  logger.debug(`Running on ${Config.ENVIRONMENT} mode`);
});

await app.listen({ port });
