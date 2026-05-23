import 'dotenv/config';
import { cookie } from '@elysiajs/cookie';
import { Elysia } from 'elysia';
import { LoginUseCase } from '@/application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '@/application/auth/use-cases/register.use-case';
import { CreateProjectUseCase } from '@/application/projects/use-cases/create-project.use-case';
import { DeleteProjectUseCase } from '@/application/projects/use-cases/delete-project.use-case';
import { FindProjectByIdUseCase } from '@/application/projects/use-cases/find-project-by-id.use-case';
import { ListProjectsByUserIdUseCase } from '@/application/projects/use-cases/list-projects-by-user-id.use-case';
import { UpdateProjectUseCase } from '@/application/projects/use-cases/update-project.use-case';
import { FindUserByIdUseCase } from '@/application/user/use-cases/find-user-by-id.use-case';
import { ProcessWebhookJobUseCase } from '@/application/webhooks/use-cases/ingest/process-webhook-job.use-case';
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
import { BcryptPasswordHasher } from '@/infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from '@/infrastructure/auth/jwt-token.service';
import { db } from '@/infrastructure/db';
import { DrizzleEndpointRepository } from '@/infrastructure/db/repositories/drizzle-endpoint.repository';
import { DrizzleProjectMemberRepository } from '@/infrastructure/db/repositories/drizzle-project-member.repository';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/drizzle-project.repository';
import { DrizzleWebhookLogRepository } from '@/infrastructure/db/repositories/drizzle-webhook-log.repository';
import { UserRepository } from '@/infrastructure/db/repositories/drizzle-user.repository';
import { BullMQWebhookQueue } from '@/infrastructure/queue/bullmq-webhook-queue';
import { FetchWebhookForwarder } from '@/infrastructure/webhooks/fetch-webhook-forwarder';
import { HmacVeloSignatureService } from '@/infrastructure/webhooks/hmac-velo-signature.service';
import { initWebhookWorker } from '@/infrastructure/workers/webhook-worker';
import { createAuthController } from '@/presentation/http/controllers/auth.controller';
import { createIngestController } from '@/presentation/http/controllers/ingest.controller';
import { createProjectsController } from '@/presentation/http/controllers/projects.controller';
import { createUsersController } from '@/presentation/http/controllers/users.controller';
import { createWebhooksController } from '@/presentation/http/controllers/webhooks.controller';
import { errorPlugin } from '@/presentation/http/errors';
import { authGuard } from '@/presentation/http/guards/auth.guard';
import { createAuthMiddleware } from '@/presentation/http/middleware/auth.middleware';
import { printRoutes } from '@/presentation/http/plugins/print-routes';
import { createPublishToFront, projectRoom } from '@/presentation/http/websocket/project-broadcaster';
import { getRedisDisplayUrl } from '@/infrastructure/queue/redis-connection';
import { runBenchmark } from './benchmark-script';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-local-jwt-secret-min-32-chars-long';

const userRepo = new UserRepository(db);
const projectRepo = new DrizzleProjectRepository(db);
const projectMemberRepo = new DrizzleProjectMemberRepository(db);
const endpointRepo = new DrizzleEndpointRepository(db);
const webhookLogRepo = new DrizzleWebhookLogRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);
const webhookQueue = new BullMQWebhookQueue();
const webhookForwarder = new FetchWebhookForwarder();
const veloSignatureService = new HmacVeloSignatureService();

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);

const createProjectUseCase = new CreateProjectUseCase(projectRepo, projectMemberRepo, userRepo);
const findProjectByIdUseCase = new FindProjectByIdUseCase(projectRepo);
const listProjectsByUserIdUseCase = new ListProjectsByUserIdUseCase(projectRepo);
const updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepo);

const findEndpointByIdUseCase = new FindEndpointByIdUseCase(endpointRepo);
const createEndpointUseCase = new CreateEndpointUseCase(endpointRepo, projectRepo);
const listEndpointsByProjectIdUseCase = new ListEndpointsByProjectIdUseCase(endpointRepo, projectRepo);
const updateEndpointUseCase = new UpdateEndpointUseCase(endpointRepo, findEndpointByIdUseCase);
const deleteEndpointUseCase = new DeleteEndpointUseCase(endpointRepo, findEndpointByIdUseCase);

const findWebhookLogByIdUseCase = new FindWebhookLogByIdUseCase(webhookLogRepo);
const createWebhookLogUseCase = new CreateWebhookLogUseCase(webhookLogRepo, endpointRepo);
const listWebhookLogsByProjectIdUseCase = new ListWebhookLogsByProjectIdUseCase(webhookLogRepo, projectRepo);
const listWebhookLogsByEndpointIdUseCase = new ListWebhookLogsByEndpointIdUseCase(webhookLogRepo, findEndpointByIdUseCase);
const updateWebhookLogUseCase = new UpdateWebhookLogUseCase(webhookLogRepo, findWebhookLogByIdUseCase);
const processWebhookJobUseCase = new ProcessWebhookJobUseCase(endpointRepo, webhookLogRepo, webhookForwarder, veloSignatureService);

const apiV1 = new Elysia({ prefix: '/api/v1', normalize: 'typebox' })
  .use(cookie())
  .use(printRoutes())
  .use(createAuthMiddleware(findUserByIdUseCase, tokenService))
  .use(authGuard)
  .use(errorPlugin)
  .use(createAuthController(loginUseCase, registerUseCase, tokenService))
  .use(createUsersController())
  .use(createProjectsController(createProjectUseCase, findProjectByIdUseCase, listProjectsByUserIdUseCase, updateProjectUseCase, deleteProjectUseCase))
  .use(
    createWebhooksController(
      createEndpointUseCase,
      findEndpointByIdUseCase,
      listEndpointsByProjectIdUseCase,
      updateEndpointUseCase,
      deleteEndpointUseCase,
      createWebhookLogUseCase,
      findWebhookLogByIdUseCase,
      listWebhookLogsByProjectIdUseCase,
      listWebhookLogsByEndpointIdUseCase,
      updateWebhookLogUseCase,
    ),
  )
  .use(createIngestController(webhookQueue))
  .get('/', () => 'Hello Elysia', { isPublic: true });

const app = new Elysia()
  .use(apiV1)
  .ws('/ws/projects/:projectId', {
    open(ws) {
      ws.subscribe(projectRoom(ws.data.params.projectId));
    },
  })
  .listen(3000);

const publishToFront = createPublishToFront((topic, data) => {
  app.server?.publish(topic, data);
});

initWebhookWorker(processWebhookJobUseCase, publishToFront);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📮 Redis (BullMQ): ${getRedisDisplayUrl()}`);

if (process.env.RUN_BENCHMARK === 'true') {
  void runBenchmark({
    baseUrl: `http://${app.server?.hostname ?? 'localhost'}:${app.server?.port ?? 3000}`,
  });
}
