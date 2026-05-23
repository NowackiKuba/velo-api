import { WebhookLogFilters, WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { EndpointId } from '@/domain/webhooks/value-objects/endpoint/endpoint-id.vo';
import { Page } from '@/utils/pagination';
import { FindEndpointByIdUseCase } from '../endpoints/find-endpoint-by-id.use-case';

export class ListWebhookLogsByEndpointIdUseCase {
  constructor(
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly findEndpointById: FindEndpointByIdUseCase,
  ) {}

  async execute(projectId: string, endpointId: string, filters?: WebhookLogFilters): Promise<Page<WebhookLog>> {
    await this.findEndpointById.execute(endpointId, projectId);

    return this.webhookLogRepo.findByEndpointId(EndpointId.create(endpointId), filters);
  }
}
