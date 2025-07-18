import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.ts';

export const documents = pgTable('documents', {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  status: text({
    enum: ['processing_queued', 'processed', 'process_fail'],
  }).notNull(),
  typeOfDocument: text({ enum: ['pdf'] }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
