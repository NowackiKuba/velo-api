import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { Project } from '@/domain/projects/entities/project';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export class FindProjectByIdUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(projectId: string): Promise<Project> {
    const project = await this.projectRepo.findById(ProjectId.create(projectId));

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${projectId} not found`);
    }

    return project;
  }
}
