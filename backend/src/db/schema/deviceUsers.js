import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const deviceUsers = pgTable('device_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull().unique(),
  deviceInfo: text('device_info'),
  refreshToken: text('refresh_token').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
});
