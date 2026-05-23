import { IngestWebhookJobPayload } from '../types/ingest-webhook-job';

export interface WebhookQueuePort {
  enqueue(job: IngestWebhookJobPayload): Promise<void>;
}
