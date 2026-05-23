import { BaseFilters, Page } from '@/utils/pagination';
import { WebhookLog } from '../entities/webhook-log';
import { WebhookLogId } from '../value-objects/webhook-log/webhook-log-id.vo';
import { EndpointId } from '../value-objects/endpoint/endpoint-id.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

export type WebhookLogFilters = BaseFilters & {
  provider?: string;
  responseStatus?: number;
  status?: string;
};

export interface WebhookLogRepositoryPort {
  save(log: WebhookLog): Promise<void>;
  findById(id: WebhookLogId): Promise<WebhookLog | null>;
  findByEndpointId(id: EndpointId, filters?: WebhookLogFilters): Promise<Page<WebhookLog>>;
  findByProjectId(id: ProjectId, filters?: WebhookLogFilters): Promise<Page<WebhookLog>>;
}
