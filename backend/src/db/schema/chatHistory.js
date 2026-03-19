import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const chatHistory = pgTable('chat_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  question: text('question'),
  answer: text('answer'),
  createdAt: timestamp('created_at').defaultNow(),
});
