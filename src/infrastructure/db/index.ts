// src/infrastructure/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL ?? 'postgres://postgres:secret_password@localhost:5432/velo_db';

// 1. Tworzymy klient połączenia (w konfiguracji produkcyjnej warto ograniczyć max liczbę połączeń)
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 20 : 5,
});

// 2. Inicjalizujemy Drizzle ORM
// Przekazujemy schemat (schema) jako drugi parametr, dzięki czemu zyskujemy dostęp
// do tzw. Relational API (czyli db.query.users.findMany({ with: { groupMemberships: true } }))
export const db = drizzle(client, { schema });
