import { and, eq, sql } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts';

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/questions',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { question } = request.body;

      const embeddings = await generateEmbeddings(question);
      const embeddingsAsString = `[${embeddings.join(',')}]`;
      const chunks = await db
        .select({
          id: schema.filesChunks.id,
          text: schema.filesChunks.text,
          similarity: sql<number>`1 - (${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
        })
        .from(schema.filesChunks)
        .where(
          and(
            eq(schema.filesChunks.roomId, roomId),
            sql`1 - (${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(
          sql`${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector desc`
        );

      let answer: string | null = null;

      if (chunks.length > 0) {
        const texts = chunks.map((chunk) => chunk.text);

        answer = await generateAnswer(question, texts);
      }
      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
          answer,
        })
        .returning();

      if (!result[0]) {
        throw new Error('Failed to create a question!');
      }

      return reply.status(201).send({ questionId: result[0].id, answer });
    }
  );
};
