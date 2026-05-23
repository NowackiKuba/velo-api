import {
  ForwardWebhookRequest,
  ForwardWebhookResult,
  WebhookForwarderPort,
} from '@/application/webhooks/ports/webhook-forwarder.port';
import { Agent, fetch } from 'undici';

const agents = new Map<string, Agent>();

const getAgent = (origin: string) => {
  const existing = agents.get(origin);

  if (existing) {
    return existing;
  }

  const agent = new Agent({
    keepAliveTimeout: 30_000,
    keepAliveMaxTimeout: 60_000,
    connections: 20,
  });

  agents.set(origin, agent);
  return agent;
};

const toResponseHeaders = (headers: { forEach: (callback: (value: string, key: string) => void) => void }): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};

  headers.forEach((value, key) => {
    normalized[key] = value;
  });

  return normalized;
};

export class FetchWebhookForwarder implements WebhookForwarderPort {
  async forward(request: ForwardWebhookRequest): Promise<ForwardWebhookResult> {
    const origin = new URL(request.url).origin;
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      signal: AbortSignal.timeout(request.timeoutMs),
      dispatcher: getAgent(origin),
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
