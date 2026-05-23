import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { EndpointCachePort } from '@/application/webhooks/ports/endpoint-cache.port';
import { VeloSignaturePort } from '@/application/webhooks/ports/velo-signature.port';
import { WebhookForwarderPort } from '@/application/webhooks/ports/webhook-forwarder.port';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLogStatusType } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-status.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

const FORWARD_TIMEOUT_MS = 5_000;
const MAX_RESPONSE_BODY_LENGTH = 16_384;

const toRequestPayload = (payload: unknown): Record<string, unknown> => {
  if (typeof payload === 'object' && payload !== null && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }

  return { value: payload };
};

const truncate = (value: string | undefined, maxLength: number): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

export class ProcessWebhookJobUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly endpointCache: EndpointCachePort,
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly forwarder: WebhookForwarderPort,
    private readonly signatureService: VeloSignaturePort,
  ) {}

  async execute(payload: IngestWebhookJobPayload): Promise<WebhookLog> {
    const endpoint = await this.resolveActiveEndpoint(payload.projectId);

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
        body: serializedPayload,
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
      responseBody = truncate(result.body, MAX_RESPONSE_BODY_LENGTH);

      if (!result.ok) {
        status = 'FAILED';
      }
    } catch (error) {
      status = 'FAILED';
      errorMessage = error instanceof Error ? error.message : 'Unknown forwarding error';
    }

    const latencyMs = Math.round(performance.now() - startTime);

    const log = WebhookLog.create({
      endpointId: endpoint.id,
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

  private async resolveActiveEndpoint(projectId: string) {
    const cached = await this.endpointCache.getActive(projectId);

    if (cached) {
      return cached;
    }

    const project = ProjectId.create(projectId);
    const endpoint = await this.endpointRepo.findActiveByProjectId(project);

    if (!endpoint) {
      return null;
    }

    const snapshot = {
      id: endpoint.id.value,
      projectId: endpoint.projectId.value,
      url: endpoint.url,
      secret: endpoint.secret,
    };

    await this.endpointCache.setActive(projectId, snapshot);

    return snapshot;
  }
}
