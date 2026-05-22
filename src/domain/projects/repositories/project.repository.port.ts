import { BaseFilters, Page } from '@/utils/pagination';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { Project } from '../entities/project';
import { ProjectId } from '../value-objects/project/project-id.vo';

export type ProjectFilters = BaseFilters & {
  search?: string;
};

export interface ProjectRepositoryPort {
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findByUserId(userId: UserId, filters?: ProjectFilters): Promise<Page<Project>>;
}
