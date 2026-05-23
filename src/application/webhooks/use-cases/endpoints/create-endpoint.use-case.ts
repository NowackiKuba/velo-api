import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export interface CreateEndpointCommand {
  projectId: string;
  name: string;
  description?: string;
  url: string;
  secret: string;
  isActive?: boolean;
}

export class CreateEndpointUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly projectRepo: ProjectRepositoryPort,
  ) {}

  async execute(payload: CreateEndpointCommand): Promise<Endpoint> {
    const projectId = ProjectId.create(payload.projectId);
    const project = await this.projectRepo.findById(projectId);

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${payload.projectId} not found`);
    }

    const endpoint = Endpoint.create({
      projectId: projectId.value,
      name: payload.name,
      description: payload.description,
      url: payload.url,
      secret: payload.secret,
      secretPrefix: payload.secret.slice(0, 12),
      isActive: payload.isActive ?? true,
    });

    await this.endpointRepo.save(endpoint);

    return endpoint;
  }
}
