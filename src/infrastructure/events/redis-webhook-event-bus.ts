import { WebhookEventPublisherPort } from '@/application/webhooks/ports/webhook-event-publisher.port';
import IORedis from 'ioredis';

export const WEBHOOK_EVENT_CHANNEL = 'velo:webhook-events';

export type WebhookEventMessage = {
  projectId: string;
  data: unknown;
};

export class RedisWebhookEventPublisher implements WebhookEventPublisherPort {
  constructor(private readonly redis: IORedis) {}

  publish(projectId: string, data: unknown): void {
    const message: WebhookEventMessage = { projectId, data };
    void this.redis.publish(WEBHOOK_EVENT_CHANNEL, JSON.stringify(message));
  }
}

export const startWebhookEventSubscriber = (
  redis: IORedis,
  onEvent: (projectId: string, data: unknown) => void,
): (() => void) => {
  const subscriber = redis.duplicate();

  void subscriber.subscribe(WEBHOOK_EVENT_CHANNEL);

  subscriber.on('message', (_channel, raw) => {
    try {
      const message = JSON.parse(raw) as WebhookEventMessage;
      onEvent(message.projectId, message.data);
    } catch (error) {
      console.error('Failed to parse webhook event message:', error);
    }
  });

  return () => {
    void subscriber.unsubscribe(WEBHOOK_EVENT_CHANNEL);
    subscriber.disconnect();
  };
};
