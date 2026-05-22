import { cookie } from '@elysiajs/cookie';
import { Elysia } from 'elysia';
import type { TokenServicePort } from '@/application/auth/ports/token-service.port';
import type { FindUserByIdUseCase } from '@/application/user/use-cases/find-user-by-id.use-case';
import type { User } from '@/domain/users/entities/user';
import { SESSION_COOKIE_NAME } from '@/presentation/http/constants/session';

const readTokenFromAuthorizationHeader = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const trimmed = authorizationHeader.trim();
  const bearerPrefix = 'Bearer ';
  const token = trimmed.startsWith(bearerPrefix) ? trimmed.slice(bearerPrefix.length).trim() : trimmed;

  return token || null;
};

/**
 * Resolves `currentUser` from the session cookie on every request.
 *
 * Elysia's `.derive()` runs before route handlers and merges values into
 * the request context. This plugin also `.use(cookie())` so cookie parsing
 * is available in the same scope as the derive (required when nesting plugins).
 */
export const createAuthMiddleware = (findUserById: FindUserByIdUseCase, tokenService: TokenServicePort) =>
  new Elysia({ name: 'auth-context' })
    .use(cookie())
    .derive({ as: 'global' }, async ({ cookie, request }): Promise<{ userId: string | null; currentUser: User | null }> => {
      const sessionTokenRaw = cookie[SESSION_COOKIE_NAME]?.value;
      const sessionToken = typeof sessionTokenRaw === 'string' ? sessionTokenRaw : null;
      const headerToken = readTokenFromAuthorizationHeader(request.headers.get('authorization'));
      const token = headerToken ?? sessionToken;

      if (!token) return { userId: null, currentUser: null };

      try {
        const payload = await tokenService.verify(token);
        if (!payload) {
          return { userId: null, currentUser: null };
        }

        const user = await findUserById.execute(payload.userId);

        if (!user) {
          return { userId: null, currentUser: null };
        }

        return { userId: payload.userId, currentUser: user };
      } catch {
        return { userId: null, currentUser: null };
      }
    });

/**
 * @deprecated Prefer global `authGuard` with `isPublic: true` on public routes.
 */
export const requireAuth = new Elysia({ name: 'require-auth' }).onBeforeHandle((context) => {
  const user = (context as { currentUser?: User | null }).currentUser ?? null;
  const { set } = context;
  if (!user) {
    set.status = 401;
    return { message: 'Unauthorized' };
  }
});
