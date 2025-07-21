import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './user.ts';

export const rooms = pgTable('rooms', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => user.id)
    .notNull(),
  name: text().notNull(),
  description: text(),
  resumeIA: text(),
  createdAt: timestamp().defaultNow().notNull(),
});
