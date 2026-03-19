import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { plans } from './plans.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password'),
  googleId: text('google_id').unique(),
  avatar: text('avatar'),
  role: text('role').notNull().default('user'),
  planId: integer('plan_id').references(() => plans.id),
  planExpiresAt: timestamp('plan_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
