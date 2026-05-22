import { Static, t } from 'elysia';

const HEX_COLOR_PATTERN = '^#[0-9a-fA-F]{6}$';

export const CreateProjectBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 25 }),
  color: t.Optional(t.String({ pattern: HEX_COLOR_PATTERN })),
});

export type CreateProjectBodyInput = Static<typeof CreateProjectBodySchema>;

export const UpdateProjectBodySchema = t.Object(
  {
    name: t.Optional(t.String({ minLength: 1, maxLength: 25 })),
    color: t.Optional(t.String({ pattern: HEX_COLOR_PATTERN })),
  },
  { minProperties: 1 },
);

export type UpdateProjectBodyInput = Static<typeof UpdateProjectBodySchema>;

export const ProjectParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

export type ProjectParamsInput = Static<typeof ProjectParamsSchema>;

export const ListProjectsQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
  orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  orderByField: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('updatedAt'), t.Literal('name')])),
  search: t.Optional(t.String()),
});

export type ListProjectsQueryInput = Static<typeof ListProjectsQuerySchema>;

export const ProjectResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  color: t.String({ pattern: HEX_COLOR_PATTERN }),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type ProjectResponse = Static<typeof ProjectResponseSchema>;
