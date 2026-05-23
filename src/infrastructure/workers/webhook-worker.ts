import { ProcessWebhookJobUseCase } from '@/application/webhooks/use-cases/ingest/process-webhook-job.use-case';
import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { WebhookEventPublisherPort } from '@/application/webhooks/ports/webhook-event-publisher.port';
import { IngestWebhookJobPayload } from '@/application/webhooks/types/ingest-webhook-job';
import { UnrecoverableError, Worker } from 'bullmq';
import { createRedisWorkerConnection } from '../queue/redis-client';
import { WEBHOOK_QUEUE_NAME } from '../queue/redis-connection';

export const initWebhookWorker = (
  processWebhookJob: ProcessWebhookJobUseCase,
  eventPublisher: WebhookEventPublisherPort,
): Worker => {
  const workerConnection = createRedisWorkerConnection();

  const worker = new Worker<IngestWebhookJobPayload>(
    WEBHOOK_QUEUE_NAME,
    async (job) => {
      try {
        const log = await processWebhookJob.execute(job.data);

        eventPublisher.publish(log.projectId.value, {
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
      connection: workerConnection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 10),
    },
  );

  worker.on('failed', (job, error) => {
    console.error(`Webhook job ${job?.id ?? 'unknown'} failed:`, error);
  });

  return worker;
};
