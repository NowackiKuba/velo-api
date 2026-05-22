import { generateCode } from '../../../utils/generate-code';

export const RESET_PASSWORD_TOKEN_LENGTH = 16;

export class ResetPasswordToken {
  private constructor(private readonly _value: string) {}

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('Reset password token cannot be empty');
    }

    if (v.length < RESET_PASSWORD_TOKEN_LENGTH) {
      throw new Error(`Reset password token cannot be shorter than ${RESET_PASSWORD_TOKEN_LENGTH} chars`);
    }

    if (v.length > RESET_PASSWORD_TOKEN_LENGTH) {
      throw new Error(`Reset password token cannot be greater than ${RESET_PASSWORD_TOKEN_LENGTH} chars`);
    }

    return new ResetPasswordToken(v);
  }

  get value(): string {
    return this._value;
  }

  static generate(): ResetPasswordToken {
    return new ResetPasswordToken(generateCode(RESET_PASSWORD_TOKEN_LENGTH));
  }
}
