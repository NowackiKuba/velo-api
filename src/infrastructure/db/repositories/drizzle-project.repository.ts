import { ProjectFilters, ProjectRepositoryPort } from '@/domain/projects/repositories/project.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../schema';
import { Project } from '@/domain/projects/entities/project';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';
import { UserId } from '@/domain/users/value-objects/user-id.vo';
import { and, asc, count, desc, eq, ilike, isNull } from 'drizzle-orm';
import { paginate, Page } from '@/utils/pagination';

type Database = PostgresJsDatabase<typeof schema>;

const PROJECT_ORDER_FIELDS = {
  createdAt: schema.projectsTable.createdAt,
  updatedAt: schema.projectsTable.updatedAt,
  name: schema.projectsTable.name,
} as const;

export class DrizzleProjectRepository implements ProjectRepositoryPort {
  constructor(private readonly db: Database) {}

  async save(project: Project): Promise<void> {
    const row = this.toEntity(project);

    await this.db
      .insert(schema.projectsTable)
      .values(row)
      .onConflictDoUpdate({
        target: schema.projectsTable.id,
        set: {
          name: row.name,
          color: row.color,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const rows = await this.db.select().from(schema.projectsTable).where(eq(schema.projectsTable.id, id.value));

    const project = rows[0];

    if (!project) {
      return null;
    }

    return this.toDomain(project);
  }

  async findByUserId(userId: UserId, filters?: ProjectFilters): Promise<Page<Project>> {
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    const orderField = filters?.orderByField ?? 'createdAt';
    const orderColumn = PROJECT_ORDER_FIELDS[orderField as keyof typeof PROJECT_ORDER_FIELDS] ?? PROJECT_ORDER_FIELDS.createdAt;
    const orderFn = filters?.orderBy === 'desc' ? desc : asc;

    const conditions = and(
      eq(schema.projectMembersTable.userId, userId.value),
      isNull(schema.projectsTable.deletedAt),
      isNull(schema.projectMembersTable.deletedAt),
      filters?.search ? ilike(schema.projectsTable.name, `%${filters.search}%`) : undefined,
    );

    const totalCountResult = await this.db
      .select({ count: count() })
      .from(schema.projectsTable)
      .innerJoin(schema.projectMembersTable, eq(schema.projectsTable.id, schema.projectMembersTable.projectId))
      .where(conditions);

    const totalCount = totalCountResult[0]?.count ?? 0;

    const rows = await this.db
      .select({ project: schema.projectsTable })
      .from(schema.projectsTable)
      .innerJoin(schema.projectMembersTable, eq(schema.projectsTable.id, schema.projectMembersTable.projectId))
      .where(conditions)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    return paginate(
      rows.map(({ project }) => this.toDomain(project)),
      { limit, offset, totalCount },
    );
  }

  private toDomain(entity: schema.DbProject): Project {
    return Project.reconstitute({
      color: entity.color,
      createdAt: entity.createdAt,
      id: entity.id,
      name: entity.name,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? undefined,
    });
  }

  private toEntity(domain: Project): schema.DbProject {
    const data = domain.toJSON();

    return {
      ...data,
      deletedAt: data.deletedAt ?? null,
    };
  }
}
