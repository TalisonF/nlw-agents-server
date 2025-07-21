/** biome-ignore-all lint/suspicious/noConsole: worker queue log */
import { type Job, Queue, Worker } from 'bullmq';
import { and, eq, sql } from 'drizzle-orm';
import { default as Redis } from 'ioredis';
import { db } from './db/connection.ts';
import { schema } from './db/schema/index.ts';
import { env } from './env.ts';
import { generateEmbeddings, generateQuickResume } from './services/gemini.ts';
import { extractTextFromPdf } from './utils/extractTextFromPdf.ts';
import { chunkText } from './utils/textChunk.ts';

const connection = new Redis.default(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const pdfProcessingQueue = new Queue('pdfProcessing', { connection });

async function processPdfJob(job: Job) {
  const { pdfPath, documentId, roomId, fileName } = job.data;
  console.log(
    `Iniciando processamento do PDF: ${pdfPath} para o documento: ${fileName}`
  );
  try {
    const pdfContent = await extractTextFromPdf(pdfPath);
    const textChunks = chunkText(pdfContent, 500, 50);

    const textAndEmbeddings: Array<{ text: string; embeddings: number[] }> = [];
    for await (const chunk of textChunks) {
      const embeddings = await generateEmbeddings(chunk);
      textAndEmbeddings.push({
        text: chunk,
        embeddings,
      });
    }

    for await (const chunk of textAndEmbeddings) {
      await db
        .insert(schema.filesChunks)
        .values({
          roomId,
          documentId,
          text: chunk.text,
          embeddings: chunk.embeddings,
          typeOfInput: 'document',
        })
        .returning();
    }

    const embeddingForResume = await generateEmbeddings(
      'Qual é o resumo principal deste documento?'
    );
    const embeddingsAsString = `[${embeddingForResume.join(',')}]`;

    const chunksForResume = await db
      .select({
        id: schema.filesChunks.id,
        text: schema.filesChunks.text,
        similarity: sql<number>`1 - (${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
      })
      .from(schema.filesChunks)
      .where(
        and(
          eq(schema.filesChunks.documentId, documentId),
          sql`1 - (${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.6`
        )
      )
      .orderBy(
        sql`${schema.filesChunks.embeddings} <=> ${embeddingsAsString}::vector desc`
      );
    const resume = await generateQuickResume(
      chunksForResume.map((chunk) => chunk.text)
    );
    console.log({
      TotalChunks: textAndEmbeddings.length,
      chunksForResume: chunksForResume.length,
      resume,
    });
    const roomResumeConsult = await db
      .select({
        roomResume: schema.rooms.resumeIA,
      })
      .from(schema.rooms)
      .where(eq(schema.rooms.id, roomId));
    const roomResume = roomResumeConsult[0].roomResume ?? '';

    const resumeRoom = await generateQuickResume([resume ?? '', roomResume]);

    await db
      .update(schema.rooms)
      .set({ resumeIA: resumeRoom })
      .where(eq(schema.rooms.id, roomId));

    await db
      .update(schema.documents)
      .set({ resumeIA: resume, status: 'processed' })
      .where(eq(schema.documents.id, documentId));

    console.log(
      `Processamento do PDF ${pdfPath} (ID: ${documentId}) concluído. ${textChunks.length} chunks.`
    );

    return { status: 'completed', textChunks: textChunks.length };
  } catch (error) {
    console.error(
      `Falha no processamento do PDF ${pdfPath} (ID: ${documentId}):`,
      error
    );
    throw error;
  } finally {
    // Opcional: Remover o arquivo PDF após o processamento, se for temporário
    // fs.unlinkSync(pdfPath);
  }
}

// Cria um worker para processar os jobs da fila
const worker = new Worker('pdfProcessing', processPdfJob, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} de PDF concluído!`);
});

worker.on('failed', async (job, err) => {
  await db
    .update(schema.documents)
    .set({ status: 'process_fail' })
    .where(eq(schema.documents.id, job?.data.documentId));
  console.error(`Job ${job?.id} de PDF falhou com erro: ${err.message}`);
});

export { pdfProcessingQueue, worker };
