import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { UserNotFoundError } from '@/application/user/errors/not-found.error';
import {
  InvalidProjectMemberStatusError,
  ProjectMemberAlreadyExistsError,
} from '@/application/project-members/errors/conflict.error';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectMember } from '@/domain/projects/entities/project-member';
import { Permission } from '@/domain/projects/value-objects/project-member/project-member-permissions.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserId } from '@/domain/users/value-objects';

export interface InviteProjectMemberCommand {
  projectId: string;
  userId: string;
  invitedById: string;
  permissions: Permission[];
}

export class InviteProjectMemberUseCase {
  constructor(
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly memberRepo: ProjectMemberRepositoryPort,
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(payload: InviteProjectMemberCommand): Promise<{ memberId: string }> {
    const projectId = ProjectId.create(payload.projectId);
    const project = await this.projectRepo.findById(projectId);

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${payload.projectId} not found`);
    }

    const userId = UserId.create(payload.userId);
    const invitedById = UserId.create(payload.invitedById);

    const [user, invitedBy] = await Promise.all([
      this.userRepo.findById(userId),
      this.userRepo.findById(invitedById),
    ]);

    if (!user) {
      throw new UserNotFoundError(`user with id: ${payload.userId} not found`);
    }

    if (!invitedBy) {
      throw new UserNotFoundError(`user with id: ${payload.invitedById} not found`);
    }

    const existingMembers = await this.memberRepo.getByProjectId(projectId, { limit: 100, offset: 0 });
    const alreadyMember = existingMembers.data.some(
      (member) => !member.isDeleted && member.userId.value === userId.value,
    );

    if (alreadyMember) {
      throw new ProjectMemberAlreadyExistsError(
        `user with id: ${userId.value} is already a member of project: ${projectId.value}`,
      );
    }

    const member = ProjectMember.create({
      projectId: projectId.value,
      userId: userId.value,
      invitedById: invitedById.value,
      permissions: payload.permissions,
      status: 'PENDING',
    });

    await this.memberRepo.save(member);

    return { memberId: member.id.value };
  }
}
