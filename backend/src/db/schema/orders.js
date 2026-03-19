import { pgTable, serial, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { orderStatus } from './enums.js';
import { users } from './users.js';
import { plans } from './plans.js';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  planId: integer('plan_id')
    .notNull()
    .references(() => plans.id),
  transactionId: text('transaction_id').notNull().unique(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  email: text('email').notNull(),
  status: orderStatus('status').notNull().default('pending'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
});
