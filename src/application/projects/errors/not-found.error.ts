import { BaseError } from '@/base-error';

export class ProjectNotFoundError extends BaseError {
  readonly code = 'PROJECT_NOT_FOUND';
}
