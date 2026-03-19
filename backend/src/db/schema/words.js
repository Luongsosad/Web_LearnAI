import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { topics } from './topics.js';

export const words = pgTable('words', {
  id: serial('id').primaryKey(),
  word: text('word').notNull(),
  meaning: text('meaning'),
  pronunciation: text('pronunciation'),
  type: text('type'),
  topicId: integer('topic_id').references(() => topics.id, {
    onDelete: 'set null',
  }),
  level: text('level'),
  example: text('example'),
});
