export interface TokenPayload {
  userId: string;
}

export interface TokenServicePort {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload | null>;
}
