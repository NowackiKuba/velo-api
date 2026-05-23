import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { VeloSignaturePort } from '@/application/webhooks/ports/velo-signature.port';
import { WebhookForwarderPort } from '@/application/webhooks/ports/webhook-forwarder.port';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLogStatusType } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-status.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

const FORWARD_TIMEOUT_MS = 5_000;

const toRequestPayload = (payload: unknown): Record<string, unknown> => {
  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return { value: payload };
};

export class ProcessWebhookJobUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly forwarder: WebhookForwarderPort,
    private readonly signatureService: VeloSignaturePort,
  ) {}

  async execute(payload: IngestWebhookJobPayload): Promise<WebhookLog> {
    const projectId = ProjectId.create(payload.projectId);
    const endpoint = await this.endpointRepo.findActiveByProjectId(projectId);

    if (!endpoint) {
      throw new EndpointNotFoundError(`active endpoint for project: ${payload.projectId} not found`);
    }

    const serializedPayload = JSON.stringify(payload.payload);
    const startTime = performance.now();

    let responseStatus: number | undefined;
    let responseHeaders: Record<string, unknown> | undefined;
    let responseBody: string | undefined;
    let status: WebhookLogStatusType = 'SUCCESS';
    let errorMessage: string | undefined;

    try {
      const signature = this.signatureService.sign(serializedPayload, endpoint.secret);
      const result = await this.forwarder.forward({
        url: endpoint.url,
        payload: payload.payload,
        headers: {
          'Content-Type': 'application/json',
          'X-Velo-Signature': signature,
          'X-Velo-Provider': payload.provider,
          ...(payload.providerEventId ? { 'X-Velo-Provider-Event-Id': payload.providerEventId } : {}),
        },
        timeoutMs: FORWARD_TIMEOUT_MS,
      });

      responseStatus = result.status;
      responseHeaders = result.headers;
      responseBody = result.body;

      if (!result.ok) {
        status = 'FAILED';
      }
    } catch (error) {
      status = 'FAILED';
      errorMessage = error instanceof Error ? error.message : 'Unknown forwarding error';
    }

    const latencyMs = Math.round(performance.now() - startTime);

    const log = WebhookLog.create({
      endpointId: endpoint.id.value,
      projectId: payload.projectId,
      provider: payload.provider,
      providerEventId: payload.providerEventId,
      requestHeaders: payload.headers,
      requestPayload: toRequestPayload(payload.payload),
      responseStatus,
      responseHeaders,
      responseBody,
      status,
      errorMessage,
      latencyMs,
    });

    await this.webhookLogRepo.save(log);

    return log;
  }
}
