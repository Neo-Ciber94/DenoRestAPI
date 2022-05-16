import { createWorker } from "../services/worker.service.ts";
import { SmtpEmailService } from "../services/smtp-email.service.ts";
import { Config } from "../config/mod.ts";
import logger from "../config/logger.ts";

export interface SendEmail {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
}

export type EmailSenderKey = "send_email";

createWorker<EmailSenderKey, SendEmail>(async (message) => {
  switch (message.type) {
    case "send_email":
      {
        const emailService = new SmtpEmailService();

        try {
          await emailService.send({
            from: Config.EMAIL_USERNAME,
            to: message.data.to,
            subject: message.data.subject,
            content: message.data.content,
            isHtml: message.data.isHtml,
          });
        } catch (e) {
          logger.error(e);
        }
      }
      break;
    default:
      break;
  }
});
