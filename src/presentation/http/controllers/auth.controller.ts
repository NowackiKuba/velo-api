import { LoginUseCase } from '@/application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '@/application/auth/use-cases/register.use-case';
import { TokenServicePort } from '@/application/auth/ports/token-service.port';
import Elysia from 'elysia';
import { LoginBodySchema, RegisterBodySchema } from '../schemas/auth.schema';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '../constants/session';

const isProduction = process.env.NODE_ENV === 'production';

export const createAuthController = (login: LoginUseCase, register: RegisterUseCase, tokenService: TokenServicePort) =>
  new Elysia({ prefix: '/auth' })
    .post(
      '/register',
      async ({ body, set }) => {
        const res = await register.execute(body);
        set.status = 201;
        return res;
      },
      {
        body: RegisterBodySchema,
        isPublic: true,
      },
    )
    .post(
      '/login',
      async ({ body, set, cookie }) => {
        const { userId } = await login.execute({
          identifier: body.identifier,
          password: body.password,
        });
        const accessToken = await tokenService.sign({ userId });

        cookie[SESSION_COOKIE_NAME].set({
          value: accessToken,
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: SESSION_MAX_AGE_SECONDS,
        });

        set.status = 200;
        return { userId, accessToken, tokenType: 'Bearer' as const };
      },
      {
        body: LoginBodySchema,
        isPublic: true,
      },
    );
