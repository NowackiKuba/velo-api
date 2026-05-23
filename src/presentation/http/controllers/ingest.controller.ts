import { WebhookQueuePort } from '@/application/webhooks/ports/webhook-queue.port';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import Elysia, { t } from 'elysia';

const normalizeHeaders = (headers: Record<string, string | undefined>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined));

const extractProviderEventId = (headers: Record<string, unknown>, payload: unknown): string | undefined => {
  const headerEventId = headers['x-provider-event-id'];

  if (typeof headerEventId === 'string' && headerEventId.length > 0) {
    return headerEventId;
  }

  if (typeof payload === 'object' && payload !== null && 'id' in payload) {
    const eventId = (payload as Record<string, unknown>).id;
    return typeof eventId === 'string' ? eventId : undefined;
  }

  return undefined;
};

export const createIngestController = (webhookQueue: WebhookQueuePort) =>
  new Elysia({ prefix: '/ingest' }).post(
    '/:projectId',
    async ({ params, body, headers, set }) => {
      const normalizedHeaders = normalizeHeaders(headers);
      const providerHeader = normalizedHeaders['x-provider'];
      const provider = typeof providerHeader === 'string' && providerHeader.length > 0 ? providerHeader : 'unknown';

      const job: IngestWebhookJobPayload = {
        projectId: params.projectId,
        provider,
        headers: normalizedHeaders,
        payload: body,
        providerEventId: extractProviderEventId(normalizedHeaders, body),
      };

      void webhookQueue.enqueue(job).catch((error) => {
        console.error('Failed to enqueue webhook job:', error);
      });

      set.status = 202;
      return { status: 'accepted' };
    },
    {
      body: t.Unknown(),
      isPublic: true,
    },
  );
