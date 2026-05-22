import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().notNull(),
  firstName: varchar('first_name', { length: 55 }).notNull(),
  lastName: varchar('last_name', { length: 55 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  tier: varchar('tier', { length: 25 }).$type<'FREE' | 'PREMIUM'>().notNull().default('FREE'),
  avatarUrl: varchar('avatar_url', { length: 2048 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbUser = typeof usersTable.$inferSelect;
export type DbNewUser = typeof usersTable.$inferInsert;
