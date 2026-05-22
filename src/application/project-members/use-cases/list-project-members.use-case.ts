import { ProjectMemberFilters, ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectMember } from '@/domain/projects/entities/project-member';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { Page } from '@/utils/pagination';

export class ListProjectMembersUseCase {
  constructor(private readonly memberRepo: ProjectMemberRepositoryPort) {}

  async execute(projectId: string, filters?: ProjectMemberFilters): Promise<Page<ProjectMember>> {
    return this.memberRepo.getByProjectId(ProjectId.create(projectId), filters);
  }
}
