import { integer, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { endpointsTable } from './endpoints';

export const webhookLogsTable = pgTable('webhook_logs', {
  id: uuid('id').primaryKey().notNull(),
  endpointId: uuid('endpoint_id')
    .references(() => endpointsTable.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id').notNull(),

  // 1. Co i skąd przyszło (Event)
  provider: varchar('provider', { length: 50 }).notNull(), // np. 'stripe', 'github'
  providerEventId: varchar('provider_event_id', { length: 255 }), // np. evt_123 ze Stripe (do deduplikacji)

  // 2. Dane HTTP (Co wysłaliśmy do serwera dewelopera)
  requestHeaders: jsonb('request_headers').notNull(),
  requestPayload: jsonb('request_payload').notNull(), // Surowy JSON, który przyszedł

  // 3. Wynik operacji (Co odpowiedział serwer dewelopera)
  responseStatus: integer('response_status'), // np. 200, 404, 500
  responseHeaders: jsonb('response_headers'),
  responseBody: varchar('response_body'), // Surowa odpowiedź z błędem od klienta

  // 4. Logika i błędy wewnętrzne (Co padło po naszej stronie)
  status: varchar('status', { enum: ['SUCCESS', 'FAILED', 'RETRYING'] }).notNull(), // 'success', 'failed', 'retrying'
  errorMessage: varchar('error_message'), // Jeśli nasz worker wywalił się np. na weryfikacji sygnatury

  // Metryki wydajnościowe (Deweloperzy to KOCHAJĄ)
  latencyMs: integer('latency_ms'), // Jak szybko ich serwer odpowiedział w milisekundach

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type DbWebhookLog = typeof webhookLogsTable.$inferSelect;
export type DbNewWebhookLog = typeof webhookLogsTable.$inferInsert;
