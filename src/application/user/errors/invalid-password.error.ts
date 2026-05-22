import { BaseError } from '@/base-error';

export class InvalidPasswordError extends BaseError {
  readonly code = 'INVALID_PASSWORD';
}
