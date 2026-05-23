import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { EndpointFilters, EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { Page } from '@/utils/pagination';

export class ListEndpointsByProjectIdUseCase {
  constructor(
    private readonly endpointRepo: EndpointRepositoryPort,
    private readonly projectRepo: ProjectRepositoryPort,
  ) {}

  async execute(projectId: string, filters?: EndpointFilters): Promise<Page<Endpoint>> {
    const id = ProjectId.create(projectId);
    const project = await this.projectRepo.findById(id);

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${projectId} not found`);
    }

    return this.endpointRepo.findByProjectId(id, filters);
  }
}
