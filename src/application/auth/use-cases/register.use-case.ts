import { UserAlreadyExistsError } from '@/application/user/errors/conflict.error';
import { User } from '@/domain/users/entities/user';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserEmail, UserUsername } from '@/domain/users/value-objects';
import { PasswordHasherPort } from '../ports/password-hasher.port';

export interface RegisterCommand {
  email: string;
  username: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(payload: RegisterCommand): Promise<{ userId: string }> {
    const userEmail = UserEmail.create(payload.email);

    const existingByEmail = await this.userRepo.findByEmail(userEmail);

    if (existingByEmail) {
      throw new UserAlreadyExistsError(`user with email address: ${userEmail.value} already exists`);
    }

    const username = UserUsername.create(payload.username);

    const existingByUsername = await this.userRepo.findByUsername(username);

    if (existingByUsername) {
      throw new UserAlreadyExistsError(`user with username: ${username} already exists`);
    }

    const hashedPassword = await this.hasher.hash(payload.password);

    const user = User.create({
      email: payload.email,
      password: hashedPassword,
      username: payload.username,
      id: crypto.randomUUID(),
    });

    await this.userRepo.save(user);

    return { userId: user.id.value };
  }
}
