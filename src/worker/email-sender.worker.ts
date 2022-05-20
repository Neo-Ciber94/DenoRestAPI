import { ERROR_EVENT_CHANNEL } from "../constants/mod.ts";
import { connectToRedis } from "../database/redis.ts";
import { RedisMessageSubscriber } from "../services/redis-pubsub.service.ts";
import { ErrorReport } from "../types/error-report.ts";
import { SmtpEmailService } from "../services/smtp-email.service.ts";
import { Config } from "../config/mod.ts";
import logger from "../config/logger.ts";

const worker = self as unknown as Worker;
const redis = await connectToRedis();
const subscriber = new RedisMessageSubscriber<ErrorReport>({
  channels: ERROR_EVENT_CHANNEL,
  client: redis,
});

worker.postMessage({
  type: "ready",
});

const emailSender = new SmtpEmailService();

subscriber.onReceive(async (message) => {
  const { method, status, url } = message;
  const to = "boniyeh816@dufeed.com";

  await emailSender.send({
    to,
    from: Config.EMAIL_USERNAME,
    subject: `Error ${status} ocurred`,
    content: `An error ${status} ocurred on ${method}: ${url}`,
  });

  logger.info(`Send email to ${to}`);
});
