import { User } from '@/domain/users/entities/user';
import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { UserId } from '@/domain/users/value-objects';

export class FindUserByIdUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(userId: string): Promise<User | null> {
    return this.userRepo.findById(UserId.create(userId));
  }
}
