import { connectToRedis } from "../database/redis.ts";
import { RedisMessageSubscriber } from "../services/redis-pubsub.service.ts";
import { SmtpEmailService } from "../services/smtp-email.service.ts";
import { Config } from "../config/mod.ts";
import logger from "../config/logger.ts";
//import { notifyReady } from "../utils/service-workers.ts";

export const SEND_EMAIL_MESSAGE_CHANNEL = "send-email-message";

const worker = self as unknown as Worker;
//notifyReady(worker);

export type SendEmailMessage = {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
};

const redis = await connectToRedis();
const subscriber = new RedisMessageSubscriber<SendEmailMessage>({
  channels: SEND_EMAIL_MESSAGE_CHANNEL,
  client: redis,
});

const emailSender = new SmtpEmailService();

subscriber.onReceive(async (message) => {
  await emailSender.send({
    from: Config.EMAIL_USERNAME,
    to: message.to,
    subject: message.subject,
    content: message.content,
    isHtml: message.isHtml,
  });

  logger.info(`Send email to ${message.to}`);
});