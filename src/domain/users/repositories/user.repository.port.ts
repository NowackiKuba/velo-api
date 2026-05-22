import { User } from '../entities/user';
import { UserEmail, UserId, UserUsername } from '../value-objects';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: UserEmail): Promise<User | null>;
  findByUsername(username: UserUsername): Promise<User | null>;
}
