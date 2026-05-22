import { BaseError } from '@/base-error';

export class UserNotFoundError extends BaseError {
  readonly code = 'USER_NOT_FOUND';
}
