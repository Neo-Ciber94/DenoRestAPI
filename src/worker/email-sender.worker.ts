import { ERROR_EVENT_CHANNEL } from "../constants/mod.ts";
import { connectToRedis } from "../database/redis.ts";
import { RedisMessageSubscriber } from "../services/redis-pubsub.service.ts";
import { ErrorReport } from "../types/error-report.ts";
import { SmtpEmailService } from "../services/smtp-email.service.ts";
import { Config } from "../config/mod.ts";

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

  emailSender.send({
    from: Config.EMAIL_USERNAME,
    to: "boniyeh816@dufeed.com",
    subject: `Error ${status} ocurred`,
    content: `An error ${status} ocurred on ${method}: ${url}`,
  });
});
