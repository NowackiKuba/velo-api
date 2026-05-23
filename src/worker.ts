import 'dotenv/config';
import { createWebhookEngine } from '@/composition/webhook-engine';
import { RedisWebhookEventPublisher } from '@/infrastructure/events/redis-webhook-event-bus';
import { getRedisDisplayUrl } from '@/infrastructure/queue/redis-connection';
import { initWebhookWorker } from '@/infrastructure/workers/webhook-worker';

const { redis, processWebhookJobUseCase } = createWebhookEngine();
const eventPublisher = new RedisWebhookEventPublisher(redis);

const worker = initWebhookWorker(processWebhookJobUseCase, eventPublisher);

console.log(`⚙️  Velo webhook worker running`);
console.log(`📮 Redis: ${getRedisDisplayUrl()}`);
console.log(`🔀 Concurrency: ${process.env.WORKER_CONCURRENCY ?? 10}`);

const shutdown = async () => {
  await worker.close();
  redis.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
