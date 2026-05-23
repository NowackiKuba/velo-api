const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class WebhookLogId {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('WebhookLog ID cannot be empty');
    }

    if (!UUID_REGEX.test(v)) {
      throw new Error(`WebhookLog ID must be an UUID`);
    }

    return new WebhookLogId(v);
  }

  static generate() {
    return new WebhookLogId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }
}
