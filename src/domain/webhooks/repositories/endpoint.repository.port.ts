import { BaseFilters, Page } from '@/utils/pagination';
import { Endpoint } from '../entities/endpoint';
import { EndpointId } from '../value-objects/endpoint/endpoint-id.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export type EndpointFilters = BaseFilters & {
  search?: string;
  isActive?: boolean;
};

export interface EndpointRepositoryPort {
  save(endpoint: Endpoint): Promise<void>;
  findById(id: EndpointId): Promise<Endpoint | null>;
  findByProjectId(projectId: ProjectId, filters?: EndpointFilters): Promise<Page<Endpoint>>;
  findActiveByProjectId(projectId: ProjectId): Promise<Endpoint | null>;
}
