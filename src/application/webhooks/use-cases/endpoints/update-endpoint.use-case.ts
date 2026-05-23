import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { FindEndpointByIdUseCase } from './find-endpoint-by-id.use-case';

export interface UpdateEndpointCommand {
  projectId: string;
  endpointId: string;
  name?: string;
  description?: string;
  url?: string;
  secret?: string;
  isActive?: boolean;
}

export class UpdateEndpointUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly findEndpointById: FindEndpointByIdUseCase,
  ) {}

  async execute(payload: UpdateEndpointCommand): Promise<Endpoint> {
    const endpoint = await this.findEndpointById.execute(payload.endpointId, payload.projectId);

    endpoint.update({
      name: payload.name,
      description: payload.description,
      url: payload.url,
      isActive: payload.isActive,
      ...(payload.secret !== undefined
        ? { secret: payload.secret, secretPrefix: payload.secret.slice(0, 12) }
        : {}),
    });

    await this.endpointRepo.save(endpoint);

    return endpoint;
  }
}
