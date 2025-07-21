import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.ts';

export const documents = pgTable('documents', {
  id: uuid().primaryKey().defaultRandom(),
  fileName: text(),
  resumeIA: text(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  status: text({
    enum: ['processing_queued', 'processed', 'process_fail'],
  }).notNull(),
  md5File: text().notNull(),
  typeOfDocument: text({ enum: ['pdf'] }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
