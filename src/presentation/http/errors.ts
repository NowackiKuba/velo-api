// src/infrastructure/http/errors.ts
import { InvalidCredentialsError } from '@/application/auth/errors/invalid-credentials.error';
import { UserAlreadyExistsError } from '@/application/user/errors/conflict.error';
import { InvalidPasswordError } from '@/application/user/errors/invalid-password.error';
import { UserNotFoundError } from '@/application/user/errors/not-found.error';
import { BaseError } from '@/base-error';
import { Elysia } from 'elysia';

const ERROR_STATUS_MAP: Record<string, number> = {
  [UserNotFoundError.name]: 404,
  [UserAlreadyExistsError.name]: 409,
  [InvalidPasswordError.name]: 401,
  [InvalidCredentialsError.name]: 401,
};

export const errorPlugin = new Elysia({ name: 'ErrorPlugin' }).onError(({ error, set }) => {
  if (error instanceof BaseError) {
    const status = ERROR_STATUS_MAP[error.name] ?? 400;

    // LOGOWANIE NA SERWERZE: Pełna informacja dla Ciebie w terminalu
    console.error(`❌ [${error.errorId}] ${error.name}: ${error.message}`);
    console.error(error.stack);

    set.status = status;
    return {
      success: false,
      code: error.code,
      message: error.message,
      errorId: error.errorId, // <--- Zwracamy identifier do klienta / bazy / frontendu
    };
  }

  // Dla krytycznych błędów systemowych (np. pad SQLite), które nie dziedziczą po BaseError
  const systemErrorId = `sys_${crypto.randomUUID()}`;
  console.error(`💥 [${systemErrorId}] CRITICAL SYSTEM ERROR:`, error);

  set.status = 500;
  return {
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected system error occurred.',
    errorId: systemErrorId,
  };
});
