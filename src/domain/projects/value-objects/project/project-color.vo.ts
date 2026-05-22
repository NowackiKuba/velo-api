const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export class ProjectColor {
  private constructor(private readonly _value: string) {}

  static isHexColor(v: string) {
    return HEX_COLOR_REGEX.test(v);
  }

  static create(v: string) {
    if (!v || v.trim().length < 0) {
      throw new Error('Project color cannot be empty');
    }

    if (!HEX_COLOR_REGEX.test(v)) {
      throw new Error('Project color must be a valid hex color (e.g. #ffffff)');
    }

    return new ProjectColor(v);
  }

  get value(): string {
    return this._value;
  }
}
