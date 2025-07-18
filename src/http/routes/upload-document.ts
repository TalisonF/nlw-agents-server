import crypto from 'node:crypto';
import fs from 'node:fs';
import { pipeline } from 'node:stream';
import util from 'node:util';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { v4 as uuidV4 } from 'uuid';
import { z } from 'zod/v4';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

const pump = util.promisify(pipeline);

export const uploadDocumentRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/document',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const file = await request.file();

      if (!file) {
        throw new Error('file is required!');
      }
      if (file.mimetype !== 'application/pdf') {
        throw new Error('file not is a pdf!');
      }

      const hash = crypto.createHash('md5');
      // biome-ignore lint/suspicious/noEvolvingTypes: dev
      const chunks = [];
      for await (const chunk of file.file) {
        chunks.push(chunk);
        hash.update(chunk);
      }
      const calculatedMd5 = hash.digest('hex');

      const documentId = uuidV4();
      const tempFilePath = `./uploads/${documentId}.pdf`;
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
      }

      await pump(file.file, fs.createWriteStream(tempFilePath));

      const documentDB = await db
        .insert(schema.documents)
        .values({
          roomId,
          md5File: calculatedMd5,
          id: documentId,
          typeOfDocument: 'pdf',
          status: 'processing_queued',
        })
        .returning();

      reply.send({
        message: 'PDF recebido e adicionado à fila de processamento.',
        documentId: documentDB[0].id,
        status: 'processing_queued',
      });
    }
  );
};
