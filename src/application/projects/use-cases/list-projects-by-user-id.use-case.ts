import { ProjectFilters, ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { Project } from '@/domain/projects/entities/project';
import { UserId } from '@/domain/users/value-objects';
import { Page } from '@/utils/pagination';

export class ListProjectsByUserIdUseCase {
  constructor(private readonly projectRepo: ProjectRepositoryPort) {}

  async execute(userId: string, filters?: ProjectFilters): Promise<Page<Project>> {
    return this.projectRepo.findByUserId(UserId.create(userId), filters);
  }
}
