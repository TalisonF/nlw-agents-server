import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { z } from 'zod/v4';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateEmbeddings } from '../../services/gemini.ts';

export const uploadTextRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/text',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          text: z.string().min(10).max(1500),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const { text } = request.body;

      const embeddings = await generateEmbeddings(text);

      const result = await db
        .insert(schema.filesChunks)
        .values({
          roomId,
          text,
          typeOfInput: 'text',
          embeddings,
        })
        .returning();

      const chunk = result[0];
      if (!chunk) {
        throw new Error('Erro ao salvar chunk!');
      }
      return reply.status(201).send({ chunkId: chunk.id });
    }
  );
};
