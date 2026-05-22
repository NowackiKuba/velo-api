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
import { BcryptPasswordHasher } from '@/infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from '@/infrastructure/auth/jwt-token.service';
import { db } from '@/infrastructure/db';
import { DrizzleProjectMemberRepository } from '@/infrastructure/db/repositories/drizzle-project-member.repository';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/drizzle-project.repository';
import { UserRepository } from '@/infrastructure/db/repositories/drizzle-user.repository';
import { createAuthController } from '@/presentation/http/controllers/auth.controller';
import { createProjectsController } from '@/presentation/http/controllers/projects.controller';
import { createUsersController } from '@/presentation/http/controllers/users.controller';
import { errorPlugin } from '@/presentation/http/errors';
import { authGuard } from '@/presentation/http/guards/auth.guard';
import { createAuthMiddleware } from '@/presentation/http/middleware/auth.middleware';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-local-jwt-secret-min-32-chars-long';

const userRepo = new UserRepository(db);
const projectRepo = new DrizzleProjectRepository(db);
const projectMemberRepo = new DrizzleProjectMemberRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);

const createProjectUseCase = new CreateProjectUseCase(projectRepo, projectMemberRepo, userRepo);
const findProjectByIdUseCase = new FindProjectByIdUseCase(projectRepo);
const listProjectsByUserIdUseCase = new ListProjectsByUserIdUseCase(projectRepo);
const updateProjectUseCase = new UpdateProjectUseCase(projectRepo);
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepo);

const app = new Elysia({
  prefix: '/api/v1',
  normalize: 'typebox',
})
  .use(cookie())
  .use(createAuthMiddleware(findUserByIdUseCase, tokenService))
  .use(authGuard)
  .use(errorPlugin)
  .use(createAuthController(loginUseCase, registerUseCase, tokenService))
  .use(createUsersController())
  .use(
    createProjectsController(
      createProjectUseCase,
      findProjectByIdUseCase,
      listProjectsByUserIdUseCase,
      updateProjectUseCase,
      deleteProjectUseCase,
    ),
  )
  .get('/', () => 'Hello Elysia', { isPublic: true })
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
