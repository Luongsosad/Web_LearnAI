import { pgTable, serial, integer, smallint, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { words } from './words.js';

export const userWords = pgTable('user_words', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  wordId: integer('word_id').references(() => words.id, { onDelete: 'cascade' }),
  status: smallint('status').default(0),
  reviewCount: integer('review_count').default(0),
  lastReviewed: timestamp('last_reviewed'),
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),
});
