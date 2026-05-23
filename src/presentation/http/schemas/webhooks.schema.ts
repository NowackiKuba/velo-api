import { Static, t } from 'elysia';

export const EndpointParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  endpointId: t.String({ format: 'uuid' }),
});

export type EndpointParamsInput = Static<typeof EndpointParamsSchema>;

export const WebhookLogParamsSchema = t.Object({
  logId: t.String({ format: 'uuid' }),
});

export type WebhookLogParamsInput = Static<typeof WebhookLogParamsSchema>;

export const ProjectWebhookLogParamsSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  logId: t.String({ format: 'uuid' }),
});

export type ProjectWebhookLogParamsInput = Static<typeof ProjectWebhookLogParamsSchema>;

export const CreateEndpointBodySchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 75 }),
  description: t.Optional(t.String({ maxLength: 500 })),
  url: t.String({ format: 'uri', minLength: 1 }),
  secret: t.String({ minLength: 1, maxLength: 255 }),
  isActive: t.Optional(t.Boolean()),
});

export type CreateEndpointBodyInput = Static<typeof CreateEndpointBodySchema>;

export const UpdateEndpointBodySchema = t.Object(
  {
    name: t.Optional(t.String({ minLength: 1, maxLength: 75 })),
    description: t.Optional(t.String({ maxLength: 500 })),
    url: t.Optional(t.String({ format: 'uri', minLength: 1 })),
    isActive: t.Optional(t.Boolean()),
    secret: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  },
  { minProperties: 1 },
);

export type UpdateEndpointBodyInput = Static<typeof UpdateEndpointBodySchema>;

export const ListEndpointsQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
  orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  orderByField: t.Optional(t.Union([t.Literal('createdAt'), t.Literal('updatedAt'), t.Literal('name')])),
  search: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
});

export type ListEndpointsQueryInput = Static<typeof ListEndpointsQuerySchema>;

export const ListWebhookLogsQuerySchema = t.Object({
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
  orderBy: t.Optional(t.Union([t.Literal('asc'), t.Literal('desc')])),
  orderByField: t.Optional(
    t.Union([t.Literal('createdAt'), t.Literal('updatedAt'), t.Literal('latencyMs'), t.Literal('responseStatus'), t.Literal('status')]),
  ),
  provider: t.Optional(t.String()),
  responseStatus: t.Optional(t.Numeric()),
  status: t.Optional(t.Union([t.Literal('SUCCESS'), t.Literal('FAILED'), t.Literal('RETRYING')])),
});

export type ListWebhookLogsQueryInput = Static<typeof ListWebhookLogsQuerySchema>;

export const CreateWebhookLogBodySchema = t.Object({
  endpointId: t.String({ format: 'uuid' }),
  provider: t.String({ minLength: 1, maxLength: 50 }),
  providerEventId: t.Optional(t.String({ maxLength: 255 })),
  requestHeaders: t.Record(t.String(), t.Unknown()),
  requestPayload: t.Record(t.String(), t.Unknown()),
  status: t.Optional(t.Union([t.Literal('SUCCESS'), t.Literal('FAILED'), t.Literal('RETRYING')])),
});

export type CreateWebhookLogBodyInput = Static<typeof CreateWebhookLogBodySchema>;

export const UpdateWebhookLogBodySchema = t.Object(
  {
    responseStatus: t.Optional(t.Numeric()),
    responseHeaders: t.Optional(t.Record(t.String(), t.Unknown())),
    responseBody: t.Optional(t.String()),
    status: t.Optional(t.Union([t.Literal('SUCCESS'), t.Literal('FAILED'), t.Literal('RETRYING')])),
    errorMessage: t.Optional(t.String()),
    latencyMs: t.Optional(t.Numeric({ minimum: 0 })),
  },
  { minProperties: 1 },
);

export type UpdateWebhookLogBodyInput = Static<typeof UpdateWebhookLogBodySchema>;
