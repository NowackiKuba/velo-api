import { UserNotFoundError } from '@/application/user/errors/not-found.error';
import { ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { Project } from '@/domain/projects/entities/project';
import { ProjectMember } from '@/domain/projects/entities/project-member';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserId } from '@/domain/users/value-objects';

export interface CreateProjectCommand {
  name: string;
  color: string;
  userId: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepositoryPort,
    private readonly memberRepo: ProjectMemberRepositoryPort,
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(payload: CreateProjectCommand): Promise<{ projectId: string }> {
    const userId = UserId.create(payload.userId);
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new UserNotFoundError(`user with id: ${userId.value} not found`);
    }

    const project = Project.create({
      name: payload.name,
      color: payload.color,
    });

    const owner = ProjectMember.create({
      projectId: project.id.value,
      userId: userId.value,
      invitedById: userId.value,
      permissions: ['*'],
      status: 'ACTIVE',
    });

    await this.projectRepo.save(project);
    await this.memberRepo.save(owner);

    return { projectId: project.id.value };
  }
}
