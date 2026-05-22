import { jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { usersTable } from '../users/users';
import { projectsTable } from './projects';

export const projectMembersTable = pgTable('project_members', {
  id: uuid('id').primaryKey().notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  permissions: jsonb('permissions').notNull(),
  invitedById: uuid('invited_by_id')
    .references(() => usersTable.id, { onDelete: 'set null' })
    .notNull(),
  status: varchar('status', { enum: ['PENDING', 'ACTIVE', 'INACTIVE'] }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbProjectMember = typeof projectMembersTable.$inferSelect;
export type DbNewProjectMember = typeof projectMembersTable.$inferInsert;
