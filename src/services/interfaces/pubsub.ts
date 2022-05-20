import { JsonValue } from "../../types/json-value.ts";

export type OnMessage<T> = (message: T) => void | Promise<void>;

export interface MessagePublisher<T extends JsonValue = string> {
  publish(message: T): Promise<void>;
  subscribe(): MessageSubscriber<T>;
}

export interface MessageSubscriber<T extends JsonValue = string> {
  onReceive(callback: OnMessage<T>): Promise<void>;
  close(): Promise<void>;
}
