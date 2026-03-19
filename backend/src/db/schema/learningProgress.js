import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const learningProgress = pgTable('learning_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  currentCourse: text('current_course'),
  totalKnown: integer('total_known').default(0),
  totalUnknown: integer('total_unknown').default(0),
  totalCorrect: integer('total_correct').default(0),
  totalWrong: integer('total_wrong').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});
