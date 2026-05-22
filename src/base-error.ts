export abstract class BaseError extends Error {
  abstract readonly code: string;
  // Unikalny identyfikator tego konkretnego wystąpienia błędu
  readonly errorId: string;

  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
    // Generujemy ID z prefiksem, np. err_550e8400-e29b-...
    this.errorId = `err_${crypto.randomUUID()}`;

    Error.captureStackTrace(this, this.constructor);
  }
}
