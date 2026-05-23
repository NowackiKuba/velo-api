import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLogStatusType } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-status.vo';
import { FindWebhookLogByIdUseCase } from './find-webhook-log-by-id.use-case';

export interface UpdateWebhookLogCommand {
  logId: string;
  projectId?: string;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  status?: WebhookLogStatusType;
  errorMessage?: string;
  latencyMs?: number;
}

export class UpdateWebhookLogUseCase {
  constructor(
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly findWebhookLogById: FindWebhookLogByIdUseCase,
  ) {}

  async execute(payload: UpdateWebhookLogCommand): Promise<WebhookLog> {
    const log = await this.findWebhookLogById.execute(payload.logId, payload.projectId);

    log.update({
      responseStatus: payload.responseStatus,
      responseHeaders: payload.responseHeaders,
      responseBody: payload.responseBody,
      status: payload.status,
      errorMessage: payload.errorMessage,
      latencyMs: payload.latencyMs,
    });

    await this.webhookLogRepo.save(log);

    return log;
  }
}
