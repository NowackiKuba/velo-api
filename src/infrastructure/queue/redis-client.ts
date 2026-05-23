import IORedis from 'ioredis';
import { createRedisConnection } from './redis-connection';

let queueClient: IORedis | null = null;

export const getRedisClient = (): IORedis => {
  if (!queueClient) {
    queueClient = new IORedis(createRedisConnection());
  }

  return queueClient;
};

export const createRedisWorkerConnection = (): IORedis => {
  return new IORedis(createRedisConnection());
};

export const createRedisSubscriber = (): IORedis => {
  return new IORedis(createRedisConnection());
};
