import {
  ForwardWebhookRequest,
  ForwardWebhookResult,
  WebhookForwarderPort,
} from '@/application/webhooks/ports/webhook-forwarder.port';

const toResponseHeaders = (headers: Headers): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};

  headers.forEach((value, key) => {
    normalized[key] = value;
  });

  return normalized;
};

export class FetchWebhookForwarder implements WebhookForwarderPort {
  async forward(request: ForwardWebhookRequest): Promise<ForwardWebhookResult> {
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.payload),
      signal: AbortSignal.timeout(request.timeoutMs),
    });

    const body = await response.text();

    return {
      status: response.status,
      headers: toResponseHeaders(response.headers),
      body,
      ok: response.ok,
    };
  }
}
