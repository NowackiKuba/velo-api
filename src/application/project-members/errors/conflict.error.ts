import { BaseError } from '@/base-error';

export class ProjectMemberAlreadyExistsError extends BaseError {
  readonly code = 'PROJECT_MEMBER_ALREADY_EXISTS';
}

export class InvalidProjectMemberStatusError extends BaseError {
  readonly code = 'INVALID_PROJECT_MEMBER_STATUS';
}
