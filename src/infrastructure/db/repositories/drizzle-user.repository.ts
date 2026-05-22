import { UserRepositoryPort } from '@/domain/users/repositories/user.repository.port';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@/infrastructure/db/schema';
import { usersTable } from '@/infrastructure/db/schema';
import { User, UserJSON } from '@/domain/users/entities/user';
import { UserEmail, UserId, UserUsername } from '@/domain/users/value-objects';
import { eq } from 'drizzle-orm';

type Database = PostgresJsDatabase<typeof schema>;

export class UserRepository implements UserRepositoryPort {
  constructor(private readonly db: Database) {}

  async findByEmail(email: UserEmail): Promise<User | null> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.email, email.value));

    const user = rows[0];

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findById(id: UserId): Promise<User | null> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.id, id.value));

    const user = rows[0];

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByUsername(username: UserUsername): Promise<User | null> {
    const rows = await this.db.select().from(usersTable).where(eq(usersTable.username, username.value));

    const user = rows[0];

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async save(user: User): Promise<User> {
    const props = user.toJSON();
    const row = this.toRow(props);

    await this.db
      .insert(usersTable)
      .values(row)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          id: row.id,
          lastResetPasswordAt: row.lastResetPasswordAt,
          resetPasswordToken: row.resetPasswordToken,
          username: row.username,
          email: row.email,
          password: row.password,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          deletedAt: row.deletedAt,
        },
      });

    return user;
  }

  private toDomain(row: schema.DbUser): User {
    return User.reconstitute({
      id: row.id,
      lastResetPasswordAt: row.lastResetPasswordAt ?? undefined,
      resetPasswordToken: row.resetPasswordToken ?? undefined,
      username: row.username,
      email: row.email,
      password: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
    });
  }

  private toRow(props: UserJSON): schema.DbUser {
    return {
      id: props.id,
      lastResetPasswordAt: props.lastResetPasswordAt ?? null,
      resetPasswordToken: props.resetPasswordToken ?? null,
      username: props.username,
      email: props.email,
      password: props.password,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt ?? null,
    };
  }
}
