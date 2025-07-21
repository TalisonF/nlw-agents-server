import { and, desc, eq, not } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import z from 'zod/v4';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export const getRoomRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/room/:roomId',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (req) => {
      const { roomId } = req.params;
      const { id: userId } = req.user;
      const room = await db
        .select({
          id: schema.rooms.id,
          name: schema.rooms.name,
          resumeIA: schema.rooms.resumeIA,
          description: schema.rooms.description,
          createdAt: schema.rooms.createdAt,
        })
        .from(schema.rooms)
        .where(
          and(eq(schema.rooms.userId, userId), eq(schema.rooms.id, roomId))
        );

      const chunksRoom = await db
        .select({
          id: schema.filesChunks.id,
          text: schema.filesChunks.text,
          typeOfInput: schema.filesChunks.typeOfInput,
          createdAt: schema.filesChunks.createdAt,
        })
        .from(schema.filesChunks)
        .where(
          and(
            eq(schema.filesChunks.roomId, roomId),
            not(eq(schema.filesChunks.typeOfInput, 'document'))
          )
        );

      const documents = await db
        .select({
          id: schema.documents.id,
          filename: schema.documents.fileName,
          resumeIA: schema.documents.resumeIA,
          status: schema.documents.status,
          createdAt: schema.documents.createdAt,
        })
        .from(schema.documents)
        .where(and(eq(schema.documents.roomId, roomId)))
        .orderBy(desc(schema.documents.createdAt));

      return { room: room[0], documents, chunksRoom };
    }
  );
};
