import { WebhookEventPublisherPort } from '@/application/webhooks/ports/webhook-event-publisher.port';

export class InProcessWebhookEventPublisher implements WebhookEventPublisherPort {
  constructor(private readonly forward: (projectId: string, data: unknown) => void) {}

  publish(projectId: string, data: unknown): void {
    this.forward(projectId, data);
  }
}
