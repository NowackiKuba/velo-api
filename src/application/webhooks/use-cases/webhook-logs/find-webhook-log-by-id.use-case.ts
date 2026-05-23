import { WebhookLogNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLogId } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-id.vo';

export class FindWebhookLogByIdUseCase {
  constructor(private readonly webhookLogRepo: WebhookLogRepositoryPort) {}

  async execute(logId: string, projectId?: string): Promise<WebhookLog> {
    const log = await this.webhookLogRepo.findById(WebhookLogId.create(logId));

    if (!log || log.isDeleted) {
      throw new WebhookLogNotFoundError(`webhook log with id: ${logId} not found`);
    }

    if (projectId && log.projectId.value !== projectId) {
      throw new WebhookLogNotFoundError(`webhook log with id: ${logId} not found`);
    }

    return log;
  }
}
