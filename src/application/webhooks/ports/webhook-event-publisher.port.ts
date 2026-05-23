export interface WebhookEventPublisherPort {
  publish(projectId: string, data: unknown): void;
}
