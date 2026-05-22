import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export class DeleteProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(projectId: string): Promise<{ projectId: string }> {
    const project = await this.projectRepo.findById(ProjectId.create(projectId));

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${projectId} not found`);
    }

    project.markDeleted();
    await this.projectRepo.save(project);

    return { projectId: project.id.value };
  }
}
