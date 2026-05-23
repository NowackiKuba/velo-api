import { boolean, index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { projectsTable } from '../projects';

export const endpointsTable = pgTable(
  'endpoints',
  {
    id: uuid('id').primaryKey().notNull(),
    projectId: uuid('project_id')
      .references(() => projectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 75 }).notNull(),
    description: varchar('description', { length: 500 }),
    url: varchar('url').notNull(),
    secret: varchar('secret', { length: 255 }).notNull(),
    secretPrefix: varchar('secret_prefix', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    index('idx_endpoints_active_by_project')
      .on(table.projectId)
      .where(sql`${table.isActive} = true and ${table.deletedAt} is null`),
  ],
);

export type DbEndpoint = typeof endpointsTable.$inferSelect;
export type DbNewEndpoint = typeof endpointsTable.$inferInsert;
