import { ProjectNotFoundError } from '@/application/projects/errors/not-found.error';
import { WebhookLogFilters, WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { Page } from '@/utils/pagination';

export class ListWebhookLogsByProjectIdUseCase {
  constructor(
    private readonly webhookLogRepo: WebhookLogRepositoryPort,
    private readonly projectRepo: ProjectRepositoryPort,
  ) {}

  async execute(projectId: string, filters?: WebhookLogFilters): Promise<Page<WebhookLog>> {
    const id = ProjectId.create(projectId);
    const project = await this.projectRepo.findById(id);

    if (!project || project.isDeleted) {
      throw new ProjectNotFoundError(`project with id: ${projectId} not found`);
    }

    return this.webhookLogRepo.findByProjectId(id, filters);
  }
}
