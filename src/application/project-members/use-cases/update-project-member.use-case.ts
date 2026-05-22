import { ProjectMemberNotFoundError } from '@/application/project-members/errors/not-found.error';
import { ProjectMember } from '@/domain/projects/entities/project-member';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { Permission } from '@/domain/projects/value-objects/project-member/project-member-permissions.vo';
import { ProjectMemberStatusType } from '@/domain/projects/value-objects/project-member/project-member-status.vo';
import { ProjectMemberId } from '@/domain/projects/value-objects/project-member/project-member-id.vo';

export interface UpdateProjectMemberCommand {
  memberId: string;
  permissions?: Permission[];
  status?: ProjectMemberStatusType;
}

export class UpdateProjectMemberUseCase {
  constructor(private readonly memberRepo: ProjectMemberRepositoryPort) {}

  async execute(payload: UpdateProjectMemberCommand): Promise<ProjectMember> {
    const member = await this.memberRepo.getById(ProjectMemberId.create(payload.memberId));

    if (!member || member.isDeleted) {
      throw new ProjectMemberNotFoundError(`project member with id: ${payload.memberId} not found`);
    }

    member.update({
      permissions: payload.permissions,
      status: payload.status,
    });

    await this.memberRepo.save(member);

    return member;
  }
}
