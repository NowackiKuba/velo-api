import type { TokenPayload, TokenServicePort } from '@/application/auth/ports/token-service.port';
import * as jose from 'jose';
import { SESSION_MAX_AGE_SECONDS } from '@/presentation/http/constants/session';

export class JwtTokenService implements TokenServicePort {
  private readonly key: Uint8Array;

  constructor(secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }

    this.key = new TextEncoder().encode(secret);
  }

  async sign(payload: TokenPayload): Promise<string> {
    return new jose.SignJWT({ userId: payload.userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
      .sign(this.key);
  }

  async verify(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.key);
      const userId = payload.userId;

      if (typeof userId !== 'string' || !userId) {
        return null;
      }

      return { userId };
    } catch {
      return null;
    }
  }
}
