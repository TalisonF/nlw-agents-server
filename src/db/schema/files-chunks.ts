import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';
import { documents } from './documents.ts';
import { rooms } from './rooms.ts';

export const filesChunks = pgTable('filesChucks', {
  id: uuid().primaryKey().defaultRandom(),
  roomId: uuid()
    .references(() => rooms.id)
    .notNull(),
  typeOfInput: text({ enum: ['audio', 'text', 'document'] }).notNull(),
  documentId: uuid().references(() => documents.id),
  text: text().notNull(),
  embeddings: vector({ dimensions: 768 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
