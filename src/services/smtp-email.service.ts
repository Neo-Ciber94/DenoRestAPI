import {
  EmailSenderService,
  EmailMessage,
} from "./interfaces/email-sender.service.ts";
import { SMTPClient } from "denomailer";
import { Config } from "../config/mod.ts";

const smtpClient = new SMTPClient({
  connection: {
    hostname: "smtp.office365.com",
    port: 587,
    tls: false,
    auth: {
      username: Config.EMAIL_USERNAME,
      password: Config.EMAIL_PASSWORD,
    },
  }
});


export class SmtpEmailService implements EmailSenderService {
  async send(props: EmailMessage): Promise<void> {
    await smtpClient.send({
      from: props.from,
      to: "sovos79205@roxoas.com",
      subject: props.subject,
      content: props.isHtml ? undefined : props.content,
      html: props.isHtml ? props.content : undefined,
    });
  }
}
