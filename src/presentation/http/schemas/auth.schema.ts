import { Static, t } from 'elysia';

export const RegisterBodySchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
  username: t.String({ minLength: 3 }),
});

export type RegisterBodyInput = Static<typeof RegisterBodySchema>;

export const LoginBodySchema = t.Object({
  identifier: t.String({}),
  password: t.String({ minLength: 8 }),
});

export type LoginBodyInput = Static<typeof LoginBodySchema>;
