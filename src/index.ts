import 'dotenv/config';
import { cookie } from '@elysiajs/cookie';
import cors from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { LoginUseCase } from '@/application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '@/application/auth/use-cases/register.use-case';
import { CreateProjectUseCase } from '@/application/projects/use-cases/create-project.use-case';
import { DeleteProjectUseCase } from '@/application/projects/use-cases/delete-project.use-case';
import { FindProjectByIdUseCase } from '@/application/projects/use-cases/find-project-by-id.use-case';
import { ListProjectsByUserIdUseCase } from '@/application/projects/use-cases/list-projects-by-user-id.use-case';
import { UpdateProjectUseCase } from '@/application/projects/use-cases/update-project.use-case';
import { FindUserByIdUseCase } from '@/application/user/use-cases/find-user-by-id.use-case';
import { ListEndpointsByProjectIdUseCase } from '@/application/webhooks/use-cases/endpoints/list-endpoints-by-project-id.use-case';
import { CreateWebhookLogUseCase } from '@/application/webhooks/use-cases/webhook-logs/create-webhook-log.use-case';
import { FindWebhookLogByIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/find-webhook-log-by-id.use-case';
import { ListWebhookLogsByEndpointIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/list-webhook-logs-by-endpoint-id.use-case';
import { ListWebhookLogsByProjectIdUseCase } from '@/application/webhooks/use-cases/webhook-logs/list-webhook-logs-by-project-id.use-case';
import { UpdateWebhookLogUseCase } from '@/application/webhooks/use-cases/webhook-logs/update-webhook-log.use-case';
import { createWebhookEngine } from '@/composition/webhook-engine';
import { BcryptPasswordHasher } from '@/infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from '@/infrastructure/auth/jwt-token.service';
import { db } from '@/infrastructure/db';
import { DrizzleEndpointRepository } from '@/infrastructure/db/repositories/drizzle-endpoint.repository';
import { DrizzleProjectMemberRepository } from '@/infrastructure/db/repositories/drizzle-project-member.repository';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/drizzle-project.repository';
import { DrizzleWebhookLogRepository } from '@/infrastructure/db/repositories/drizzle-webhook-log.repository';
import { UserRepository } from '@/infrastructure/db/repositories/drizzle-user.repository';
import { InProcessWebhookEventPublisher } from '@/infrastructure/events/in-process-webhook-event-publisher';
import { createRedisSubscriber } from '@/infrastructure/queue/redis-client';
import { startWebhookEventSubscriber } from '@/infrastructure/events/redis-webhook-event-bus';
import { BullMQWebhookQueue } from '@/infrastructure/queue/bullmq-webhook-queue';
import { getRedisDisplayUrl } from '@/infrastructure/queue/redis-connection';
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

const {
  redis,
  processWebhookJobUseCase,
  createEndpointUseCase,
  updateEndpointUseCase,
  deleteEndpointUseCase,
  findEndpointByIdUseCase,
} = createWebhookEngine();

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);

const createProjectUseCase = new CreateProjectUseCase(projectRepo, projectMemberRepo, userRepo);
const findProjectByIdUseCase = new FindProjectByIdUseCase(projectRepo);
const listProjectsByUserIdUseCase = new ListProjectsByUserIdUseCase(projectRepo);
const updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepo);

const listEndpointsByProjectIdUseCase = new ListEndpointsByProjectIdUseCase(endpointRepo, projectRepo);

const findWebhookLogByIdUseCase = new FindWebhookLogByIdUseCase(webhookLogRepo);
const createWebhookLogUseCase = new CreateWebhookLogUseCase(webhookLogRepo, endpointRepo);
const listWebhookLogsByProjectIdUseCase = new ListWebhookLogsByProjectIdUseCase(webhookLogRepo, projectRepo);
const listWebhookLogsByEndpointIdUseCase = new ListWebhookLogsByEndpointIdUseCase(webhookLogRepo, findEndpointByIdUseCase);
const updateWebhookLogUseCase = new UpdateWebhookLogUseCase(webhookLogRepo, findWebhookLogByIdUseCase);

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
  .use(cors({ origin: 'http://localhost:5173' }))
  .listen(3000);

const publishToFront = createPublishToFront((topic, data) => {
  app.server?.publish(topic, data);
});

const stopWebhookEventSubscriber = startWebhookEventSubscriber(createRedisSubscriber(), publishToFront);

if (process.env.ENABLE_EMBEDDED_WORKER === 'true') {
  const eventPublisher = new InProcessWebhookEventPublisher(publishToFront);
  initWebhookWorker(processWebhookJobUseCase, eventPublisher);
  console.log('⚙️  Embedded webhook worker enabled');
}

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📮 Redis (BullMQ): ${getRedisDisplayUrl()}`);

if (process.env.RUN_BENCHMARK === 'true') {
  void runBenchmark({
    baseUrl: `http://${app.server?.hostname ?? 'localhost'}:${app.server?.port ?? 3000}`,
  });
}

process.on('SIGINT', () => {
  stopWebhookEventSubscriber();
  redis.disconnect();
});

process.on('SIGTERM', () => {
  stopWebhookEventSubscriber();
  redis.disconnect();
});
