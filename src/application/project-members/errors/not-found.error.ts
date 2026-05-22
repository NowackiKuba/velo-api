import { BaseError } from '@/base-error';

export class ProjectMemberNotFoundError extends BaseError {
  readonly code = 'PROJECT_MEMBER_NOT_FOUND';
}
