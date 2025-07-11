import { fastifyCors } from '@fastify/cors';
import { fastifyMultipart } from '@fastify/multipart';
import { fastify } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.ts';
import { createQuestionRoute } from './http/routes/create-question.ts';
import { createRoomsRoute } from './http/routes/create-room.ts';
import { getRoomsRoute } from './http/routes/get-rooms.ts';
import { getRoomsQuestionsRoute } from './http/routes/get-rooms-questions.ts';
import { uploadAudioRoute } from './http/routes/upload-audio.ts';
import { uploadTextRoute } from './http/routes/upload-text.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: '*',
});
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.register(fastifyMultipart);

app.get('/health', () => {
  // biome-ignore lint/suspicious/noConsole: debug
  console.log('Health check called!');
  return 'OK';
});

app.register(getRoomsRoute);
app.register(createRoomsRoute);
app.register(getRoomsQuestionsRoute);
app.register(createQuestionRoute);
app.register(uploadAudioRoute);
app.register(uploadTextRoute);

const PORT = env.PORT;

app.listen({ port: PORT, host: '0.0.0.0' }).then(() => {
  // biome-ignore lint/suspicious/noConsole: server start!
  console.log(`Server running! check health: http://localhost:${PORT}/health`);
});
