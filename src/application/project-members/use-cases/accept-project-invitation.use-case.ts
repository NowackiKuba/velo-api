import {
  InvalidProjectMemberStatusError,
} from '@/application/project-members/errors/conflict.error';
import { ProjectMemberNotFoundError } from '@/application/project-members/errors/not-found.error';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectMemberId } from '@/domain/projects/value-objects/project-member/project-member-id.vo';

export interface AcceptProjectInvitationCommand {
  memberId: string;
  userId: string;
}

export class AcceptProjectInvitationUseCase {
  constructor(private readonly memberRepo: ProjectMemberRepositoryPort) {}

  async execute(payload: AcceptProjectInvitationCommand): Promise<{ memberId: string }> {
    const member = await this.memberRepo.getById(ProjectMemberId.create(payload.memberId));

    if (!member || member.isDeleted) {
      throw new ProjectMemberNotFoundError(`project member with id: ${payload.memberId} not found`);
    }

    if (member.userId.value !== payload.userId) {
      throw new ProjectMemberNotFoundError(`project member with id: ${payload.memberId} not found`);
    }

    if (member.status.value !== 'PENDING') {
      throw new InvalidProjectMemberStatusError(
        `project member with id: ${payload.memberId} cannot accept invitation with status: ${member.status.value}`,
      );
    }

    member.update({ status: 'ACTIVE' });
    await this.memberRepo.save(member);

    return { memberId: member.id.value };
  }
}
