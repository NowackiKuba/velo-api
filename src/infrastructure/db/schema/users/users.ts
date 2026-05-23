import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { projectsTable } from '../projects';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  activeProjectId: uuid('active_project_id').references(() => projectsTable.id, { onDelete: 'cascade' }),
  resetPasswordToken: varchar('reset_password_token', { length: 16 }),
  lastResetPasswordAt: timestamp('last_reset_password_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbUser = typeof usersTable.$inferSelect;
export type DbNewUser = typeof usersTable.$inferInsert;
