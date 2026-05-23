import { WebhookLogFilters, WebhookLogRepositoryPort } from '@/domain/webhooks/repositories/webhook-log.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import { WebhookLogId } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-id.vo';
import { WebhookLogStatusType } from '@/domain/webhooks/value-objects/webhook-log/webhook-log-status.vo';
import { EndpointId } from '@/domain/webhooks/value-objects/endpoint/endpoint-id.vo';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { and, asc, count, desc, eq, isNull, SQL } from 'drizzle-orm';
import { paginate, Page } from '@/utils/pagination';

type Database = PostgresJsDatabase<typeof schema>;

const WEBHOOK_LOG_ORDER_FIELDS = {
  createdAt: schema.webhookLogsTable.createdAt,
  updatedAt: schema.webhookLogsTable.updatedAt,
  latencyMs: schema.webhookLogsTable.latencyMs,
  responseStatus: schema.webhookLogsTable.responseStatus,
  status: schema.webhookLogsTable.status,
} as const;

export class DrizzleWebhookLogRepository implements WebhookLogRepositoryPort {
  constructor(private readonly db: Database) {}

  async findById(id: WebhookLogId): Promise<WebhookLog | null> {
    const rows = await this.db.select().from(schema.webhookLogsTable).where(eq(schema.webhookLogsTable.id, id.value));

    const log = rows[0];

    if (!log) {
      return null;
    }

    return this.toDomain(log);
  }

  async save(log: WebhookLog): Promise<void> {
    const row = this.toEntity(log);

    await this.db
      .insert(schema.webhookLogsTable)
      .values(row)
      .onConflictDoUpdate({
        target: schema.webhookLogsTable.id,
        set: {
          responseStatus: row.responseStatus,
          responseHeaders: row.responseHeaders,
          responseBody: row.responseBody,
          status: row.status,
          errorMessage: row.errorMessage,
          latencyMs: row.latencyMs,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });
  }

  async findByEndpointId(endpointId: EndpointId, filters?: WebhookLogFilters): Promise<Page<WebhookLog>> {
    return this.findPaged(
      and(eq(schema.webhookLogsTable.endpointId, endpointId.value), this.buildFilterConditions(filters)),
      filters,
    );
  }

  async findByProjectId(projectId: ProjectId, filters?: WebhookLogFilters): Promise<Page<WebhookLog>> {
    return this.findPaged(
      and(eq(schema.webhookLogsTable.projectId, projectId.value), this.buildFilterConditions(filters)),
      filters,
    );
  }

  private buildFilterConditions(filters?: WebhookLogFilters): SQL | undefined {
    return and(
      isNull(schema.webhookLogsTable.deletedAt),
      filters?.provider ? eq(schema.webhookLogsTable.provider, filters.provider) : undefined,
      filters?.responseStatus !== undefined
        ? eq(schema.webhookLogsTable.responseStatus, filters.responseStatus)
        : undefined,
      filters?.status ? eq(schema.webhookLogsTable.status, filters.status as WebhookLogStatusType) : undefined,
    );
  }

  private async findPaged(conditions: SQL | undefined, filters?: WebhookLogFilters): Promise<Page<WebhookLog>> {
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    const orderField = filters?.orderByField ?? 'createdAt';
    const orderColumn =
      WEBHOOK_LOG_ORDER_FIELDS[orderField as keyof typeof WEBHOOK_LOG_ORDER_FIELDS] ??
      WEBHOOK_LOG_ORDER_FIELDS.createdAt;
    const orderFn = filters?.orderBy === 'desc' ? desc : asc;

    const totalCountResult = await this.db
      .select({ count: count() })
      .from(schema.webhookLogsTable)
      .where(conditions);

    const totalCount = totalCountResult[0]?.count ?? 0;

    const rows = await this.db
      .select()
      .from(schema.webhookLogsTable)
      .where(conditions)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    return paginate(
      rows.map((row) => this.toDomain(row)),
      { limit, offset, totalCount },
    );
  }

  private toDomain(entity: schema.DbWebhookLog): WebhookLog {
    return WebhookLog.reconstitute({
      id: entity.id,
      endpointId: entity.endpointId,
      projectId: entity.projectId,
      provider: entity.provider,
      providerEventId: entity.providerEventId ?? undefined,
      requestHeaders: entity.requestHeaders as Record<string, unknown>,
      requestPayload: entity.requestPayload as Record<string, unknown>,
      responseStatus: entity.responseStatus ?? undefined,
      responseHeaders: (entity.responseHeaders as Record<string, unknown> | null) ?? undefined,
      responseBody: entity.responseBody ?? undefined,
      status: entity.status as WebhookLogStatusType,
      errorMessage: entity.errorMessage ?? undefined,
      latencyMs: entity.latencyMs ?? undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? undefined,
    });
  }

  private toEntity(domain: WebhookLog): schema.DbWebhookLog {
    const data = domain.toJSON();

    return {
      ...data,
      providerEventId: data.providerEventId ?? null,
      responseStatus: data.responseStatus ?? null,
      responseHeaders: data.responseHeaders ?? null,
      responseBody: data.responseBody ?? null,
      errorMessage: data.errorMessage ?? null,
      latencyMs: data.latencyMs ?? null,
      deletedAt: data.deletedAt ?? null,
    };
  }
}
