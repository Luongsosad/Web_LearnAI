import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  topicCount: integer('topic_count').default(0),
});
