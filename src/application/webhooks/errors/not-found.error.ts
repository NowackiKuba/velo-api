import { BaseError } from '@/base-error';

export class EndpointNotFoundError extends BaseError {
  readonly code = 'ENDPOINT_NOT_FOUND';
}

export class WebhookLogNotFoundError extends BaseError {
  readonly code = 'WEBHOOK_LOG_NOT_FOUND';
}
