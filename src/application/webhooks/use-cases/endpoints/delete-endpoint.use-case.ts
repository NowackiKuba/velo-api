import { EndpointCachePort } from '@/application/webhooks/ports/endpoint-cache.port';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { FindEndpointByIdUseCase } from './find-endpoint-by-id.use-case';

export class DeleteEndpointUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly findEndpointById: FindEndpointByIdUseCase,
    private readonly endpointCache: EndpointCachePort,
  ) {}

  async execute(projectId: string, endpointId: string): Promise<{ endpointId: string }> {
    const endpoint = await this.findEndpointById.execute(endpointId, projectId);

    endpoint.markDeleted();
    await this.endpointRepo.save(endpoint);
    await this.endpointCache.invalidate(projectId);

    return { endpointId: endpoint.id.value };
  }
}
