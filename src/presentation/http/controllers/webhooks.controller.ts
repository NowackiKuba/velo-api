import { CreateEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/create-endpoint.use-case';
import { DeleteEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/delete-endpoint.use-case';
import { FindEndpointByIdUseCase } from '@/application/webhooks/use-cases/endpoints/find-endpoint-by-id.use-case';
import { ListEndpointsByProjectIdUseCase } from '@/application/webhooks/use-cases/endpoints/list-endpoints-by-project-id.use-case';
import { UpdateEndpointUseCase } from '@/application/webhooks/use-cases/endpoints/update-endpoint.use-case';
import { CreateWebhookLogUseCase } from '@/application/webhooks/use-cases/webhook-logs/create-webhook-log.use-case';
import { FindWebhookLogByIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/find-webhook-log-by-id.use-case';
import { ListWebhookLogsByEndpointIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/list-webhook-logs-by-endpoint-id.use-case';
import { ListWebhookLogsByProjectIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/list-webhook-logs-by-project-id.use-case';
import { UpdateWebhookLogUseCase } from '@/application/webhooks/use-cases/webhook-logs/update-webhook-log.use-case';
import { Endpoint } from '@/domain/webhooks/entities/endpoint';
import { WebhookLog } from '@/domain/webhooks/entities/webhook-log';
import Elysia from 'elysia';
import {
  CreateEndpointBodySchema,
  CreateWebhookLogBodySchema,
  EndpointParamsSchema,
  ListEndpointsQuerySchema,
  ListWebhookLogsQuerySchema,
  ProjectWebhookLogParamsSchema,
  UpdateEndpointBodySchema,
  UpdateWebhookLogBodySchema,
  WebhookLogParamsSchema,
} from '../schemas/webhooks.schema';
import { ProjectParamsSchema } from '../schemas/project.schema';

const toPublicEndpoint = (endpoint: Endpoint) => ({
  id: endpoint.id.value,
  projectId: endpoint.projectId.value,
  name: endpoint.name,
  description: endpoint.description,
  url: endpoint.url,
  secretPrefix: endpoint.secretPrefix,
  isActive: endpoint.isActive,
  createdAt: endpoint.createdAt,
  updatedAt: endpoint.updatedAt,
});

const toPublicWebhookLog = (log: WebhookLog) => ({
  id: log.id.value,
  endpointId: log.endpointId.value,
  projectId: log.projectId.value,
  provider: log.provider,
  providerEventId: log.providerEventId,
  requestHeaders: log.requestHeaders,
  requestPayload: log.requestPayload,
  responseStatus: log.responseStatus,
  responseHeaders: log.responseHeaders,
  responseBody: log.responseBody,
  status: log.status.value,
  errorMessage: log.errorMessage,
  latencyMs: log.latencyMs,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

const mapWebhookLogFilters = (query: {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  orderByField?: string;
  provider?: string;
  responseStatus?: number;
  status?: 'SUCCESS' | 'FAILED' | 'RETRYING';
}) => ({
  limit: query.limit,
  offset: query.offset,
  orderBy: query.orderBy,
  orderByField: query.orderByField,
  provider: query.provider,
  responseStatus: query.responseStatus,
  status: query.status,
});

export const createWebhooksController = (
  createEndpoint: CreateEndpointUseCase,
  findEndpointById: FindEndpointByIdUseCase,
  listEndpointsByProjectId: ListEndpointsByProjectIdUseCase,
  updateEndpoint: UpdateEndpointUseCase,
  deleteEndpoint: DeleteEndpointUseCase,
  createWebhookLog: CreateWebhookLogUseCase,
  findWebhookLogById: FindWebhookLogByIdUseCase,
  listWebhookLogsByProjectId: ListWebhookLogsByProjectIdUseCase,
  listWebhookLogsByEndpointId: ListWebhookLogsByEndpointIdUseCase,
  updateWebhookLog: UpdateWebhookLogUseCase,
) =>
  new Elysia()
    .group('/projects/:id/endpoints', (app) =>
      app
        .post(
          '/',
          async ({ params, body, set }) => {
            const endpoint = await createEndpoint.execute({
              projectId: params.id,
              name: body.name,
              description: body.description,
              url: body.url,
              secret: body.secret,
              isActive: body.isActive,
            });

            set.status = 201;
            return toPublicEndpoint(endpoint);
          },
          {
            params: ProjectParamsSchema,
            body: CreateEndpointBodySchema,
          },
        )
        .get(
          '/',
          async ({ params, query }) => {
            const page = await listEndpointsByProjectId.execute(params.id, {
              limit: query.limit,
              offset: query.offset,
              orderBy: query.orderBy,
              orderByField: query.orderByField,
              search: query.search,
              isActive: query.isActive,
            });

            return {
              data: page.data.map((endpoint) => toPublicEndpoint(endpoint)),
              page: page.page,
            };
          },
          {
            params: ProjectParamsSchema,
            query: ListEndpointsQuerySchema,
          },
        )
        .get(
          '/:endpointId',
          async ({ params }) => toPublicEndpoint(await findEndpointById.execute(params.endpointId, params.id)),
          {
            params: EndpointParamsSchema,
          },
        )
        .patch(
          '/:endpointId',
          async ({ params, body }) =>
            toPublicEndpoint(
              await updateEndpoint.execute({
                projectId: params.id,
                endpointId: params.endpointId,
                name: body.name,
                description: body.description,
                url: body.url,
                secret: body.secret,
                isActive: body.isActive,
              }),
            ),
          {
            params: EndpointParamsSchema,
            body: UpdateEndpointBodySchema,
          },
        )
        .delete(
          '/:endpointId',
          async ({ params }) => deleteEndpoint.execute(params.id, params.endpointId),
          {
            params: EndpointParamsSchema,
          },
        )
        .get(
          '/:endpointId/logs',
          async ({ params, query }) => {
            const page = await listWebhookLogsByEndpointId.execute(
              params.id,
              params.endpointId,
              mapWebhookLogFilters(query),
            );

            return {
              data: page.data.map(toPublicWebhookLog),
              page: page.page,
            };
          },
          {
            params: EndpointParamsSchema,
            query: ListWebhookLogsQuerySchema,
          },
        ),
    )
    .group('/projects/:id/webhook-logs', (app) =>
      app
        .post(
          '/',
          async ({ params, body, set }) => {
            const res = await createWebhookLog.execute({
              projectId: params.id,
              endpointId: body.endpointId,
              provider: body.provider,
              providerEventId: body.providerEventId,
              requestHeaders: body.requestHeaders,
              requestPayload: body.requestPayload,
              status: body.status,
            });

            set.status = 201;
            return res;
          },
          {
            params: ProjectParamsSchema,
            body: CreateWebhookLogBodySchema,
          },
        )
        .get(
          '/',
          async ({ params, query }) => {
            const page = await listWebhookLogsByProjectId.execute(params.id, mapWebhookLogFilters(query));

            return {
              data: page.data.map(toPublicWebhookLog),
              page: page.page,
            };
          },
          {
            params: ProjectParamsSchema,
            query: ListWebhookLogsQuerySchema,
          },
        )
        .get(
          '/:logId',
          async ({ params }) => toPublicWebhookLog(await findWebhookLogById.execute(params.logId, params.id)),
          {
            params: ProjectWebhookLogParamsSchema,
          },
        )
        .patch(
          '/:logId',
          async ({ params, body }) =>
            toPublicWebhookLog(
              await updateWebhookLog.execute({
                logId: params.logId,
                projectId: params.id,
                responseStatus: body.responseStatus,
                responseHeaders: body.responseHeaders,
                responseBody: body.responseBody,
                status: body.status,
                errorMessage: body.errorMessage,
                latencyMs: body.latencyMs,
              }),
            ),
          {
            params: ProjectWebhookLogParamsSchema,
            body: UpdateWebhookLogBodySchema,
          },
        ),
    )
    .get(
      '/webhook-logs/:logId',
      async ({ params }) => toPublicWebhookLog(await findWebhookLogById.execute(params.logId)),
      {
        params: WebhookLogParamsSchema,
      },
    );
