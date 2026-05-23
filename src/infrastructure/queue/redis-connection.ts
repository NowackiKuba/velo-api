export const WEBHOOK_QUEUE_NAME = 'webhook-engine';

const parsePort = (value: string | undefined, fallback: number) => {
  const port = Number(value ?? fallback);
  return Number.isFinite(port) ? port : fallback;
};

export const createRedisConnection = () => {
  const maxRetriesPerRequest = null;

  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      maxRetriesPerRequest,
    };
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parsePort(process.env.REDIS_PORT, 6379),
    maxRetriesPerRequest,
  };
};

export const getRedisDisplayUrl = () =>
  process.env.REDIS_URL ?? `${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`;
