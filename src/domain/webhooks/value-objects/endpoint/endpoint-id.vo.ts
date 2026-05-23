const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class EndpointId {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('Endpoint ID cannot be empty');
    }

    if (!UUID_REGEX.test(v)) {
      throw new Error(`Endpoint ID must be an UUID`);
    }

    return new EndpointId(v);
  }

  static generate() {
    return new EndpointId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }
}
