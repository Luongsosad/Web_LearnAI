import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { categories } from './categories.js';

export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'cascade',
  }),
  wordCount: integer('word_count').default(0),
});
