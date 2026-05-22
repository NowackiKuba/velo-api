import { ProjectMemberNotFoundError } from '@/application/project-members/errors/not-found.error';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectMemberId } from '@/domain/projects/value-objects/project-member/project-member-id.vo';

export class RemoveProjectMemberUseCase {
  constructor(private readonly memberRepo: ProjectMemberRepositoryPort) {}

  async execute(memberId: string): Promise<{ memberId: string }> {
    const member = await this.memberRepo.getById(ProjectMemberId.create(memberId));

    if (!member || member.isDeleted) {
      throw new ProjectMemberNotFoundError(`project member with id: ${memberId} not found`);
    }

    member.markDeleted();
    await this.memberRepo.save(member);

    return { memberId: member.id.value };
  }
}
