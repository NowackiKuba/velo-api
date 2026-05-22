import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // 1. Gdzie Drizzle ma szukać Twoich schematów tabel (skanuje cały folder)
  schema: './src/infrastructure/db/schema/**/*',

  // 2. Gdzie mają być generowane pliki migracji w formacie .sql
  out: './src/infrastructure/db/migrations',

  // 3. Jaki dialekt bazy danych obsługujemy
  dialect: 'postgresql',

  // 4. Dane dostępowe do bazy danych (pobierane ze zmiennych środowiskowych)
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:secret_password@localhost:5432/velo_db',
  },

  // Opcje dodatkowe, np. wymuszenie potwierdzenia przy niebezpiecznych operacjach na produkcji
  strict: true,
  verbose: true,
});
