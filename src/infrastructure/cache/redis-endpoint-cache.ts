import {
  CachedActiveEndpoint,
  EndpointCachePort,
} from '@/application/webhooks/ports/endpoint-cache.port';
import IORedis from 'ioredis';

const CACHE_KEY_PREFIX = 'velo:endpoint:active:';
const DEFAULT_TTL_SECONDS = 60;

const cacheKey = (projectId: string) => `${CACHE_KEY_PREFIX}${projectId}`;

export class RedisEndpointCache implements EndpointCachePort {
  constructor(
    private readonly redis: IORedis,
    private readonly ttlSeconds = Number(process.env.ENDPOINT_CACHE_TTL_SECONDS ?? DEFAULT_TTL_SECONDS),
  ) {}

  async getActive(projectId: string): Promise<CachedActiveEndpoint | null> {
    const raw = await this.redis.get(cacheKey(projectId));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CachedActiveEndpoint;
  }

  async setActive(projectId: string, endpoint: CachedActiveEndpoint): Promise<void> {
    await this.redis.set(cacheKey(projectId), JSON.stringify(endpoint), 'EX', this.ttlSeconds);
  }

  async invalidate(projectId: string): Promise<void> {
    await this.redis.del(cacheKey(projectId));
  }
}
