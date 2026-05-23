export type ForwardWebhookRequest = {
  url: string;
  body: string;
  headers: Record<string, string>;
  timeoutMs: number;
};

export type ForwardWebhookResult = {
  status: number;
  headers: Record<string, unknown>;
  body: string;
  ok: boolean;
};

export interface WebhookForwarderPort {
  forward(request: ForwardWebhookRequest): Promise<ForwardWebhookResult>;
}
