import { BaseError } from '@/base-error';

export class InvalidCredentialsError extends BaseError {
  readonly code = 'INVALID_CREDENTIALS';
}
