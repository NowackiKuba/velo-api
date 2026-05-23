import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { EndpointId } from '@/domain/webhooks/value-objects/endpoint/endpoint-id.vo';
import { WebhookLogStatusType } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-status.vo';

export interface CreateWebhookLogCommand {
  endpointId: string;
  projectId: string;
  provider: string;
  providerEventId?: string;
  requestHeaders: Record<string, unknown>;
  requestPayload: Record<string, unknown>;
  status?: WebhookLogStatusType;
}

export class CreateWebhookLogUseCase {
  constructor(
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly endpointRepo: EndpointRepositoryPort,
  ) {}

  async execute(payload: CreateWebhookLogCommand): Promise<{ logId: string }> {
    const endpoint = await this.endpointRepo.findById(EndpointId.create(payload.endpointId));

    if (!endpoint || endpoint.isDeleted || endpoint.projectId.value !== payload.projectId) {
      throw new EndpointNotFoundError(`endpoint with id: ${payload.endpointId} not found`);
    }

    const log = WebhookLog.create({
      endpointId: payload.endpointId,
      projectId: payload.projectId,
      provider: payload.provider,
      providerEventId: payload.providerEventId,
      requestHeaders: payload.requestHeaders,
      requestPayload: payload.requestPayload,
      status: payload.status ?? 'RETRYING',
    });

    await this.webhookLogRepo.save(log);

    return { logId: log.id.value };
  }
}
