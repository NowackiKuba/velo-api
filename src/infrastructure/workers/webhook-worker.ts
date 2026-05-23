import { ProcessWebhookJobUseCase } from '@/application/webhooks/use-cases/ingest/process-webhook-job.use-case';
import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import { UnrecoverableError, Worker } from 'bullmq';
import { createRedisConnection, WEBHOOK_QUEUE_NAME } from '../queue/redis-connection';

export type PublishToFront = (projectId: string, data: unknown) => void;

export const initWebhookWorker = (
  processWebhookJob: ProcessWebhookJobUseCase,
  publishToFront: PublishToFront,
): Worker => {
  const worker = new Worker<IngestWebhookJobPayload>(
    WEBHOOK_QUEUE_NAME,
    async (job) => {
      try {
        const log = await processWebhookJob.execute(job.data);

        publishToFront(log.projectId.value, {
          type: 'WEBHOOK_MUTATION',
          log: log.toJSON(),
        });
      } catch (error) {
        if (error instanceof EndpointNotFoundError) {
          throw new UnrecoverableError(error.message);
        }

        throw error;
      }
    },
    {
      connection: createRedisConnection(),
      concurrency: 10,
    },
  );

  worker.on('failed', (job, error) => {
    console.error(`Webhook job ${job?.id ?? 'unknown'} failed:`, error);
  });

  return worker;
};
