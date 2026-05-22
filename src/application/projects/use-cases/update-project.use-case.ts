import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { Project } from '@/domain/projects/entities/project';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export interface UpdateProjectCommand {
  projectId: string;
  name?: string;
  color?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(payload: UpdateProjectCommand): Promise<Project> {
    const project = await this.projectRepo.findById(ProjectId.create(payload.projectId));

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${payload.projectId} not found`);
    }

    project.update({
      name: payload.name,
      color: payload.color,
    });

    await this.projectRepo.save(project);

    return project;
  }
}
