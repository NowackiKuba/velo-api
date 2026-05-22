import { ProjectMember } from '@/domain/projects/entities/project-member';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectMemberId } from '@/domain/projects/value-objects/project-member/project-member-id.vo';

export class FindProjectMemberByIdUseCase {
  constructor(private readonly memberRepo: ProjectMemberRepositoryPort) {}

  async execute(memberId: string): Promise<ProjectMember | null> {
    return this.memberRepo.getById(ProjectMemberId.create(memberId));
  }
}
