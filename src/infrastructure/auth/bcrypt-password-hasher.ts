import type { PasswordHasherPort } from '@/application/auth/ports/password-hasher.port';
import bcrypt from 'bcrypt';

const ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, ROUNDS);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
