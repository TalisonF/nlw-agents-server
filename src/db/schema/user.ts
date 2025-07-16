import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  name: text(),
  password: text(),
  createdAt: timestamp().defaultNow().notNull(),
});
