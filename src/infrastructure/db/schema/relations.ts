import { relations } from 'drizzle-orm';
import { projectMembersTable } from './projects/project-members';
import { projectsTable } from './projects/projects';
import { usersTable } from './users/users';

export const usersRelations = relations(usersTable, ({ many }) => ({
  projectMemberships: many(projectMembersTable, { relationName: 'projectMembership' }),
  invitedProjectMemberships: many(projectMembersTable, { relationName: 'projectInvitation' }),
}));

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  members: many(projectMembersTable),
}));

export const projectMembersRelations = relations(projectMembersTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [projectMembersTable.projectId],
    references: [projectsTable.id],
  }),
  user: one(usersTable, {
    fields: [projectMembersTable.userId],
    references: [usersTable.id],
    relationName: 'projectMembership',
  }),
  invitedBy: one(usersTable, {
    fields: [projectMembersTable.invitedById],
    references: [usersTable.id],
    relationName: 'projectInvitation',
  }),
}));
