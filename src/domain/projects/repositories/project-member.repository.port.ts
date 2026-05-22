import { BaseFilters, Page } from '@/utils/pagination';
import { ProjectMember } from '../entities/project-member';
import { ProjectMemberId } from '../value-objects/project-member/project-member-id.vo';
import { ProjectMemberStatusType } from '../value-objects/project-member/project-member-status.vo';
import { ProjectId } from '../value-objects/project/project-id.vo';

export type ProjectMemberFilters = BaseFilters & {
  search?: string;
  status?: ProjectMemberStatusType;
  invitedBy?: string;
};

export interface ProjectMemberRepositoryPort {
  save(member: ProjectMember): Promise<void>;
  getById(id: ProjectMemberId): Promise<ProjectMember | null>;
  getByProjectId(projectId: ProjectId, filters?: ProjectMemberFilters): Promise<Page<ProjectMember>>;
}
