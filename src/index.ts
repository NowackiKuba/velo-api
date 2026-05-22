import 'dotenv/config';
import { cookie } from '@elysiajs/cookie';
import { Elysia } from 'elysia';
import { LoginUseCase } from '@/application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '@/application/auth/use-cases/register.use-case';
import { FindUserByIdUseCase } from '@/application/users/use-cases/find-user-by-id.use-case';
import { BcryptPasswordHasher } from '@/infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from '@/infrastructure/auth/jwt-token.service';
import { db } from '@/infrastructure/db';
import { UserRepository } from '@/infrastructure/db/repositories/drizzle-user.repository';
import { createAuthController } from '@/presentation/http/controllers/auth.controller';
import { errorPlugin } from '@/presentation/http/errors';
import { authGuard } from '@/presentation/http/guards/auth.guard';
import { createAuthMiddleware } from '@/presentation/http/middleware/auth.middleware';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-local-jwt-secret-min-32-chars-long';

const userRepo = new UserRepository(db);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(jwtSecret);

const loginUseCase = new LoginUseCase(userRepo, passwordHasher);
const registerUseCase = new RegisterUseCase(userRepo, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepo);

const app = new Elysia({
  prefix: '/api/v1',
  normalize: 'typebox',
})
  .use(cookie())
  .use(createAuthMiddleware(findUserByIdUseCase, tokenService))
  .use(authGuard)
  .use(errorPlugin)
  .use(createAuthController(loginUseCase, registerUseCase, tokenService))
  .get('/', () => 'Hello Elysia', { isPublic: true })
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
