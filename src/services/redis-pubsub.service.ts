import { Redis, RedisSubscription } from "redis";
import { redisInstance } from "../database/redis.ts";
import { JsonValue } from "../types/json-value.ts";
import {
  MessagePublisher,
  MessageSubscriber,
  OnMessage,
} from "./interfaces/pubsub.ts";

export interface RedisMessagePublisherConfig {
  channel: string;
  client?: Redis;
}

export class RedisMessagePublisher<T extends JsonValue>
  implements MessagePublisher<T>
{
  private readonly channel: string;
  private client: Redis;

  constructor(config: RedisMessagePublisherConfig) {
    this.client = config.client ?? redisInstance;
    this.channel = config.channel;
  }

  async publish(message: T): Promise<void> {
    await this.client.publish(this.channel, JSON.stringify(message));
  }

  subscribe(client?: Redis): MessageSubscriber<T> {
    return new RedisMessageSubscriber<T>({
      channels: this.channel,
      client: client ?? this.client,
    });
  }
}

export interface RedisMessageSubscriberConfig {
  channels: string[] | string;
  isPattern?: boolean;
  client?: Redis;
}

export class RedisMessageSubscriber<T extends JsonValue>
  implements MessageSubscriber<T>
{
  private readonly channels: string[];
  private readonly isPattern: boolean;
  private client: Redis;
  private subscription?: RedisSubscription<string>;

  constructor(config: RedisMessageSubscriberConfig) {
    this.channels = Array.isArray(config.channels)
      ? config.channels
      : [config.channels];
    this.isPattern = config.isPattern == null ? false : true;
    this.client = config.client ?? redisInstance;
  }

  async onReceive(callback: OnMessage<T>): Promise<void> {
    if (this.isPattern) {
      this.subscription = await this.client.psubscribe(...this.channels);
    } else {
      this.subscription = await this.client.subscribe(...this.channels);
    }

    for await (const { message } of this.subscription.receive()) {
      setTimeout(async () => await callback(JSON.parse(message)), 0);
    }
  }

  async close(): Promise<void> {
    if (this.subscription) {
      await this.subscription.subscribe();
      await this.subscription.close();
      this.subscription = undefined;
    }
  }
}
