import { relations } from 'drizzle-orm';
import { projectMembersTable } from './projects/project-members';
import { projectsTable } from './projects/projects';
import { usersTable } from './users/users';
import { endpointsTable } from './webhooks/endpoints';
import { webhookLogsTable } from './webhooks/webhook-logs';

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  projectMemberships: many(projectMembersTable, { relationName: 'projectMembership' }),
  invitedProjectMemberships: many(projectMembersTable, { relationName: 'projectInvitation' }),
  activeProject: one(projectsTable, {
    fields: [usersTable.activeProjectId],
    references: [projectsTable.id],
    relationName: 'activeProject',
  }),
}));

export const projectsRelations = relations(projectsTable, ({ many }) => ({
  members: many(projectMembersTable),
  endpoints: many(endpointsTable),
  webhookLogs: many(webhookLogsTable),
  activeUsers: many(usersTable, { relationName: 'activeProject' }),
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

export const endpointsRelations = relations(endpointsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [endpointsTable.projectId],
    references: [projectsTable.id],
  }),
  webhookLogs: many(webhookLogsTable),
}));

export const webhookLogsRelations = relations(webhookLogsTable, ({ one }) => ({
  endpoint: one(endpointsTable, {
    fields: [webhookLogsTable.endpointId],
    references: [endpointsTable.id],
  }),
  project: one(projectsTable, {
    fields: [webhookLogsTable.projectId],
    references: [projectsTable.id],
  }),
}));
