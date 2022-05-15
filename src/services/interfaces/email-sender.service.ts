export interface EmailMessage {
  from: string;
  to: string[] | string;
  subject: string;
  content: string;
  isHtml?: boolean;
}

export interface EmailSenderService {
  send(props: EmailMessage): Promise<void>;
}
