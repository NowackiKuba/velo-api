export type WebhookLogStatusType = 'SUCCESS' | 'FAILED' | 'RETRYING';

export const VALID_TYPES: WebhookLogStatusType[] = ['SUCCESS', 'FAILED', 'RETRYING'];

export class WebhookLogStatus {
  private constructor(private readonly _value: WebhookLogStatusType) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('Webhook log status cannot be empty');
    }

    const validStatus = VALID_TYPES.find((t) => t === v);

    if (!validStatus) {
      throw new Error(`Invalid webhook log status: ${v}`);
    }

    return new WebhookLogStatus(validStatus);
  }

  static success() {
    return new WebhookLogStatus('SUCCESS');
  }

  static failed() {
    return new WebhookLogStatus('FAILED');
  }

  static retrying() {
    return new WebhookLogStatus('RETRYING');
  }

  get value(): WebhookLogStatusType {
    return this._value;
  }
}
