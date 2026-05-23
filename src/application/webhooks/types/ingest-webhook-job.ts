export type IngestWebhookJobPayload = {
  projectId: string;
  provider: string;
  headers: Record<string, unknown>;
  payload: unknown;
  providerEventId?: string;
};
