import { EndpointNotFoundError } from '@/application/webhooks/errors/not-found.error';
import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { EndpointId } from '@/domain/webhooks/value-objects/endpoint/endpoint-id.vo';

export class FindEndpointByIdUseCase {
  constructor(private readonly endpointRepo: EndpointRepositoryPort) {}

  async execute(endpointId: string, projectId?: string): Promise<Endpoint> {
    const endpoint = await this.endpointRepo.findById(EndpointId.create(endpointId));

    if (!endpoint || endpoint.isDeleted) {
      throw new EndpointNotFoundError(`endpoint with id: ${endpointId} not found`);
    }

    if (projectId && endpoint.projectId.value !== projectId) {
      throw new EndpointNotFoundError(`endpoint with id: ${endpointId} not found`);
    }

    return endpoint;
  }
}
