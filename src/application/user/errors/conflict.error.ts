import { BaseError } from '@/base-error';

export class UserAlreadyExistsError extends BaseError {
  readonly code = 'USER_ALREADY_EXISTS';
}
