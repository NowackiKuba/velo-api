import Elysia from 'elysia';
import { User } from '@/domain/users/entities/user';

const toPublicUser = (user: User) => ({
  id: user.id.value,
  username: user.username.value,
  email: user.email.value,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const createUsersController = () => new Elysia({ prefix: '/users' }).get('/me', ({ currentUser }) => toPublicUser(currentUser!));
