const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserEmail {
  private constructor(private readonly _value: string) {}

  static isEmail(v: string) {
    return EMAIL_REGEX.test(v);
  }

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error(`User email cannot be empty`);
    }

    if (!EMAIL_REGEX.test(v)) {
      throw new Error(`Invalid email format`);
    }

    return new UserEmail(v);
  }

  get value(): string {
    return this._value;
  }
}
