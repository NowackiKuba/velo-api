import { ProjectMemberFilters, ProjectMemberRepositoryPort } from '@/domain/projects/repositories/project-member.repository.port';
import * as schema from '../schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ProjectMember } from '@/domain/projects/entities/project-member';
import { ProjectMemberId } from '@/domain/projects/value-objects/project-member/project-member-id.vo';
import { and, asc, count, desc, eq, ilike, isNull, or, SQL } from 'drizzle-orm';
import { ProjectMemberStatusType } from '@/domain/projects/value-objects/project-member/project-member-status.vo';
import { paginate, Page } from '@/utils/pagination';
import { ProjectId } from '@/domain/projects/value-objects/project/project-id.vo';

type Database = PostgresJsDatabase<typeof schema>;

const PROJECT_MEMBER_ORDER_FIELDS = {
  status: schema.projectMembersTable.status,
  createdAt: schema.projectMembersTable.createdAt,
  updatedAt: schema.projectMembersTable.updatedAt,
} as const;

export class DrizzleProjectMemberRepository implements ProjectMemberRepositoryPort {
  constructor(private readonly db: Database) {}

  async save(member: ProjectMember): Promise<void> {
    const row = this.toEntity(member);

    await this.db
      .insert(schema.projectMembersTable)
      .values(row)
      .onConflictDoUpdate({
        target: schema.projectMembersTable.id,
        set: {
          permissions: row.permissions,
          status: row.status,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });
  }

  async getById(id: ProjectMemberId): Promise<ProjectMember | null> {
    const rows = await this.db.select().from(schema.projectMembersTable).where(eq(schema.projectMembersTable.id, id.value));

    const member = rows[0];

    if (!member) {
      return null;
    }

    return this.toDomain(member);
  }

  async getByProjectId(projectId: ProjectId, filters?: ProjectMemberFilters): Promise<Page<ProjectMember>> {
    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    const orderField = filters?.orderByField ?? 'createdAt';
    const orderColumn =
      PROJECT_MEMBER_ORDER_FIELDS[orderField as keyof typeof PROJECT_MEMBER_ORDER_FIELDS] ??
      PROJECT_MEMBER_ORDER_FIELDS.createdAt;
    const orderFn = filters?.orderBy === 'desc' ? desc : asc;

    const conditions = this.buildConditions(projectId, filters);

    const totalCountResult = filters?.search
      ? await this.db
          .select({ count: count() })
          .from(schema.projectMembersTable)
          .innerJoin(schema.usersTable, eq(schema.projectMembersTable.userId, schema.usersTable.id))
          .where(conditions)
      : await this.db.select({ count: count() }).from(schema.projectMembersTable).where(conditions);

    const totalCount = totalCountResult[0]?.count ?? 0;

    const rows = filters?.search
      ? await this.db
          .select({ member: schema.projectMembersTable })
          .from(schema.projectMembersTable)
          .innerJoin(schema.usersTable, eq(schema.projectMembersTable.userId, schema.usersTable.id))
          .where(conditions)
          .orderBy(orderFn(orderColumn))
          .limit(limit)
          .offset(offset)
      : await this.db
          .select()
          .from(schema.projectMembersTable)
          .where(conditions)
          .orderBy(orderFn(orderColumn))
          .limit(limit)
          .offset(offset);

    const members = rows.map((row) => this.toDomain('member' in row ? row.member : row));

    return paginate(members, { limit, offset, totalCount });
  }

  private buildConditions(projectId: ProjectId, filters?: ProjectMemberFilters): SQL | undefined {
    return and(
      eq(schema.projectMembersTable.projectId, projectId.value),
      isNull(schema.projectMembersTable.deletedAt),
      filters?.status ? eq(schema.projectMembersTable.status, filters.status) : undefined,
      filters?.invitedBy ? eq(schema.projectMembersTable.invitedById, filters.invitedBy) : undefined,
      filters?.search
        ? or(
            ilike(schema.usersTable.username, `%${filters.search}%`),
            ilike(schema.usersTable.email, `%${filters.search}%`),
          )
        : undefined,
    );
  }

  private toDomain(entity: schema.DbProjectMember): ProjectMember {
    return ProjectMember.reconstitute({
      id: entity.id,
      projectId: entity.projectId,
      userId: entity.userId,
      permissions: entity.permissions as string[],
      invitedById: entity.invitedById,
      status: (entity.status ?? 'PENDING') as ProjectMemberStatusType,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt ?? undefined,
    });
  }

  private toEntity(domain: ProjectMember): schema.DbProjectMember {
    const data = domain.toJSON();

    return {
      ...data,
      deletedAt: data.deletedAt ?? null,
    };
  }
}
