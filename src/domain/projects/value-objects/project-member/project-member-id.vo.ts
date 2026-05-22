const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ProjectMemberId {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('ProjectMember ID cannot be empty');
    }

    if (!UUID_REGEX.test(v)) {
      throw new Error(`ProjectMember ID must be an UUID`);
    }

    return new ProjectMemberId(v);
  }

  static generate() {
    return new ProjectMemberId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }
}
