import { Config } from "../../config/mod.ts";
import { fullScan, redisInstance } from "../../database/redis.ts";
import { ApplicationError } from "../../errors/app.error.ts";
import { RedisMessagePublisher } from "../../services/redis-pubsub.service.ts";
import { User } from "./auth.model.ts";
import { UserService } from "./user.service.ts";

export const SEND_EMAIL_MESSAGE_CHANNEL = "send-email-message";
const CONFIRM_EMAIL_TOKEN_KEY = "confirm_email_token";

export type SendEmailMessage = {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
};

export class EmailConfirmationService {
  private userService = new UserService();
  private emailPublisher = new RedisMessagePublisher<SendEmailMessage>({
    channel: SEND_EMAIL_MESSAGE_CHANNEL,
  });

  generateConfirmationToken(): string {
    const s1 = crypto.randomUUID();
    const s2 = crypto.randomUUID();
    return (s1 + s2).replaceAll("-", "");
  }

  async sendConfirmationEmail(
    user: User,
    confirmationUrl: string,
    token: string
  ): Promise<void> {
    if (user.isEmailConfirmed === true) {
      ApplicationError.throwBadRequest("User email is already confirmed");
    }

    // We remove the previous confirmation tokens
    await this.clearSentConfirmationTokens(user);

    const content = this.createConfirmationEmail(user, confirmationUrl);
    await redisInstance.set(keyFor(user, token), user.id, {
      ex: Config.CONFIRMATION_EMAIL_TOKEN_EXPIRES_SECS,
    });

    await this.emailPublisher.publish({
      content,
      subject: "Confirm your email address",
      to: user.email,
      isHtml: true,
    });
  }

  async confirmUserEmail(confirmationToken: string): Promise<void> {
    const userId = await redisInstance.get(
      `${CONFIRM_EMAIL_TOKEN_KEY}:${confirmationToken}`
    );
    if (!userId) {
      ApplicationError.throwBadRequest("Invalid confirmation token");
    }

    const user = await this.userService.get(userId);
    if (!user) {
      ApplicationError.throwBadRequest("Invalid confirmation token");
    }

    await this.userService.update({ id: userId, isEmailConfirmed: true });
    await redisInstance.del(keyFor(user, confirmationToken));
  }

  private async clearSentConfirmationTokens(user: User): Promise<void> {
    for await (const key of fullScan(redisInstance, keyFor(user, "*"))) {
      await redisInstance.del(key);
    }
  }

  private createConfirmationEmail(user: User, url: string): string {
    return `
      Hello <strong>${user.username}</strong>!,
      
      Confirm your email address by clicking on the link below:
        <hr/>
        <a href='${url}'>${url}</a>
      `;
  }
}

function keyFor(user: User, token: string): string {
  return `${CONFIRM_EMAIL_TOKEN_KEY}:${user.email}:${token}`;
}
