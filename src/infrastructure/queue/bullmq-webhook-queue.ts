import { WebhookQueuePort } from '@/application/webhooks/ports/webhook-queue.port';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import { Queue } from 'bullmq';
import { getRedisClient } from './redis-client';
import { WEBHOOK_QUEUE_NAME } from './redis-connection';

export class BullMQWebhookQueue implements WebhookQueuePort {
  private readonly queue: Queue;

  constructor() {
    this.queue = new Queue(WEBHOOK_QUEUE_NAME, {
      connection: getRedisClient(),
    });
  }

  async enqueue(job: IngestWebhookJobPayload): Promise<void> {
    await this.queue.add('process', job, {
      jobId: job.providerEventId ? `${job.projectId}:${job.providerEventId}` : undefined,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });
  }
}
