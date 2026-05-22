import { Elysia } from 'elysia';
import { User } from '@/domain/users/entities/user';

/**
 * Global auth guard — all routes require authentication unless marked `isPublic: true`.
 *
 * Must be registered after `createAuthMiddleware` so `currentUser` is available.
 *
 * @example
 * .get('/health', () => ({ ok: true }), { isPublic: true })
 */
export const authGuard = new Elysia({ name: 'auth-guard' })
  .macro({
    isPublic(enabled: boolean) {
      if (!enabled) return;

      return {
        resolve: () => ({ skipAuth: true as const }),
      };
    },
  })
  .onBeforeHandle((context) => {
    if ((context as { skipAuth?: boolean }).skipAuth) return;

    const user = (context as { currentUser?: User | null }).currentUser ?? null;
    if (!user) {
      context.set.status = 401;
      return { message: 'Unauthorized' };
    }
  });
