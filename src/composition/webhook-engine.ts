import { ProcessWebhookJobUseCase } from '@/application/webhooks/use-cases/ingest/process-webhook-job.use-case';
import { CreateEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/create-endpoint.use-case';
import { DeleteEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/delete-endpoint.use-case';
import { FindEndpointByIdUseCase } from '@/application/webhooks/use-cases/endpoints/find-endpoint-by-id.use-case';
import { UpdateEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/update-endpoint.use-case';
import { RedisEndpointCache } from '@/infrastructure/cache/redis-endpoint-cache';
import { db } from '@/infrastructure/db';
import { DrizzleEndpointRepository } from '@/infrastructure/db/repositories/drizzle-endpoint.repository';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/drizzle-project.repository';
import { DrizzleWebhookLogRepository } from '@/infrastructure/db/repositories/drizzle-webhook-log.repository';
import { getRedisClient } from '@/infrastructure/queue/redis-client';
import { FetchWebhookForwarder } from '@/infrastructure/webhooks/fetch-webhook-forwarder';
import { HmacVeloSignatureService } from '@/infrastructure/webhooks/hmac-velo-signature.service';

export const createWebhookEngine = () => {
  const endpointRepo = new DrizzleEndpointRepository(db);
  const projectRepo = new DrizzleProjectRepository(db);
  const webhookLogRepo = new DrizzleWebhookLogRepository(db);
  const redis = getRedisClient();
  const endpointCache = new RedisEndpointCache(redis);
  const webhookForwarder = new FetchWebhookForwarder();
  const veloSignatureService = new HmacVeloSignatureService();

  const findEndpointByIdUseCase = new FindEndpointByIdUseCase(endpointRepo);
  const processWebhookJobUseCase = new ProcessWebhookJobUseCase(
    endpointRepo,
    endpointCache,
    webhookLogRepo,
    webhookForwarder,
    veloSignatureService,
  );

  const createEndpointUseCase = new CreateEndpointUseCase(endpointRepo, projectRepo, endpointCache);
  const updateEndpointUseCase = new UpdateEndpointUseCase(endpointRepo, findEndpointByIdUseCase, endpointCache);
  const deleteEndpointUseCase = new DeleteEndpointUseCase(endpointRepo, findEndpointByIdUseCase, endpointCache);

  return {
    redis,
    endpointCache,
    processWebhookJobUseCase,
    createEndpointUseCase,
    updateEndpointUseCase,
    deleteEndpointUseCase,
    findEndpointByIdUseCase,
  };
};
