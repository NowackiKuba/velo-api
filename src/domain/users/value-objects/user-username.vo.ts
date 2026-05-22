export const USERNAME_MAX_LENGTH = 30;

export class UserUsername {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('username cannot be empty');
    }

    if (v.length > USERNAME_MAX_LENGTH) {
      throw new Error(`username cannot be longer than ${USERNAME_MAX_LENGTH} chars`);
    }

    return new UserUsername(v);
  }

  get value(): string {
    return this._value;
  }
}
