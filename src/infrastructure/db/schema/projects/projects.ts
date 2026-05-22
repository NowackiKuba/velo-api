import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().notNull(),
  name: varchar('name', { length: 25 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#ffffff'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbProject = typeof projectsTable.$inferSelect;
export type DbNewProject = typeof projectsTable.$inferInsert;
