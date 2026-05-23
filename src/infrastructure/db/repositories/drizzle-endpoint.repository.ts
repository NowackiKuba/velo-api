import { EndpointFilters, EndpointRepositoryPort } from '@/domain/webhooks/repositories/endpoint.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { EndpointId } from '@/domain/webhooks/value-objects/endpoint/endpoint-id.vo';
import { and, asc, count, desc, eq, ilike, isNull } from 'drizzle-orm';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { paginate, Page } from '@/utils/pagination';

type Database = PostgresJsDatabase<typeof schema>;

const ENDPOINT_ORDER_FIELDS = {
  createdAt: schema.endpointsTable.createdAt,
  updatedAt: schema.endpointsTable.updatedAt,
  name: schema.endpointsTable.name,
} as const;

export class DrizzleEndpointRepository implements EndpointRepositoryPort {
  constructor(private readonly db: Database) {}

  async findById(id: EndpointId): Promise<Endpoint | null> {
    const rows = await this.db.select().from(schema.endpointsTable).where(eq(schema.endpointsTable.id, id.value));

    const endpoint = rows[0];

    if (!endpoint) {
      return null;
    }

    return this.toDomain(endpoint);
  }

  async save(endpoint: Endpoint): Promise<void> {
    const row = this.toEntity(endpoint);

    await this.db
      .insert(schema.endpointsTable)
      .values(row)
      .onConflictDoUpdate({
        target: schema.endpointsTable.id,
        set: {
          name: row.name,
          projectId: row.projectId,
          description: row.description,
          url: row.url,
          secret: row.secret,
          secretPrefix: row.secretPrefix,
          isActive: row.isActive,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });
  }

  async findActiveByProjectId(projectId: ProjectId): Promise<Endpoint | null> {
    const rows = await this.db
      .select()
      .from(schema.endpointsTable)
      .where(
        and(
          eq(schema.endpointsTable.projectId, projectId.value),
          eq(schema.endpointsTable.isActive, true),
          isNull(schema.endpointsTable.deletedAt),
        ),
      )
      .orderBy(asc(schema.endpointsTable.createdAt))
      .limit(1);

    const endpoint = rows[0];

    if (!endpoint) {
      return null;
    }

    return this.toDomain(endpoint);
  }

  async findByProjectId(projectId: ProjectId, filters?: EndpointFilters): Promise<Page<Endpoint>> {
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    const orderField = filters?.orderByField ?? 'createdAt';
    const orderColumn =
      ENDPOINT_ORDER_FIELDS[orderField as keyof typeof ENDPOINT_ORDER_FIELDS] ?? ENDPOINT_ORDER_FIELDS.createdAt;
    const orderFn = filters?.orderBy === 'desc' ? desc : asc;

    const conditions = and(
      eq(schema.endpointsTable.projectId, projectId.value),
      isNull(schema.endpointsTable.deletedAt),
      filters?.search ? ilike(schema.endpointsTable.name, `%${filters.search}%`) : undefined,
      filters?.isActive !== undefined ? eq(schema.endpointsTable.isActive, filters.isActive) : undefined,
    );

    const totalCountResult = await this.db
      .select({ count: count() })
      .from(schema.endpointsTable)
      .where(conditions);

    const totalCount = totalCountResult[0]?.count ?? 0;

    const rows = await this.db
      .select()
      .from(schema.endpointsTable)
      .where(conditions)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    return paginate(
      rows.map((row) => this.toDomain(row)),
      { limit, offset, totalCount },
    );
  }

  private toDomain(entity: schema.DbEndpoint): Endpoint {
    return Endpoint.reconstitute({
      ...entity,
      description: entity.description ?? undefined,
      deletedAt: entity.deletedAt ?? undefined,
    });
  }

  private toEntity(domain: Endpoint): schema.DbEndpoint {
    const data = domain.toJSON();

    return {
      ...data,
      deletedAt: data.deletedAt ?? null,
      description: data.description ?? null,
    };
  }
}
