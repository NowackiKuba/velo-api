import { InvalidCredentialsError } from '@/application/auth/errors/invalid-credentials.error';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserEmail, UserUsername } from '@/domain/users/value-objects';
import { PasswordHasherPort } from '../ports/password-hasher.port';

export interface LoginCommand {
  identifier: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: LoginCommand): Promise<{ userId: string }> {
    const isEmail = UserEmail.isEmail(command.identifier);
    const identifier = isEmail ? UserEmail.create(command.identifier) : UserUsername.create(command.identifier);
    const user = isEmail
      ? await this.userRepo.findByEmail(identifier as UserEmail)
      : await this.userRepo.findByUsername(identifier as UserUsername);

    const valid = user ? await this.passwordHasher.verify(command.password, user.password) : false;

    if (!user || !valid) {
      throw new InvalidCredentialsError('Invalid email/username or password');
    }

    return { userId: user.id.value };
  }
}
