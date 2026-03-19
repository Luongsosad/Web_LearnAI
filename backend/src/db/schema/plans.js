import { pgTable, serial, text, integer, numeric } from 'drizzle-orm/pg-core';

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).default('0'),
  durationDays: integer('duration_days'),
  maxQuota: integer('max_quota'),
  description: text('description'),
});
