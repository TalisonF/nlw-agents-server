import fCookie from '@fastify/cookie';
import { fastifyCors } from '@fastify/cors';
import fJWT, { type FastifyJWT } from '@fastify/jwt';
import { fastifyMultipart } from '@fastify/multipart';
import {
  type FastifyReply,
  type FastifyRequest,
  fastify,
  type HookHandlerDoneFunction,
} from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { sql } from './db/connection.ts';
import { env } from './env.ts';
import { createQuestionRoute } from './http/routes/create-question.ts';
import { createRoomsRoute } from './http/routes/create-room.ts';
import { getRoomsRoute } from './http/routes/get-rooms.ts';
import { getRoomsQuestionsRoute } from './http/routes/get-rooms-questions.ts';
import { uploadAudioRoute } from './http/routes/upload-audio.ts';
import { uploadDocumentRoute } from './http/routes/upload-document.ts';
import { uploadTextRoute } from './http/routes/upload-text.ts';
import { userRoute } from './http/routes/user-routes.ts';
import './queue.ts';
import { getRoomRoute } from './http/routes/get-room.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: '*',
});
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);
app.register(fastifyMultipart, {
  limits: { fileSize: 7 * 1024 * 1024 }, // Limite de 7MB para o arquivo
});

app.register(fJWT, { secret: 'superSecretCode-CHANGE_THIS-USE_ENV_FILE' });

app.addHook('preHandler', (req, _res, next) => {
  req.jwt = app.jwt;
  return next();
});

app.register(fCookie, {
  secret: 'some-secret-key',
  hook: 'preHandler',
});

app.decorate(
  'authenticate',
  (req: FastifyRequest, reply: FastifyReply, next: HookHandlerDoneFunction) => {
    console.log({ headers: req.headers });
    const token = req.headers.access_token || req.headers.Access_token || '';
    if (!token) {
      return reply.status(401).send({ message: 'Authentication required' });
    }
    const decoded = req.jwt.verify<FastifyJWT['user']>(`${token}`);
    req.user = decoded;
    return next();
  }
);

app.get('/health', async () => {
  // biome-ignore lint/suspicious/noConsole: debug
  console.log('Health check called!');
  const dbConnection = await sql`SELECT 1 AS DB_CONNECTED`;
  return {
    dataBaseCheck: dbConnection[0].db_connected === 1,
  };
});

app.register(getRoomsRoute);
app.register(getRoomRoute);
app.register(createRoomsRoute);
app.register(uploadDocumentRoute);
app.register(getRoomsQuestionsRoute);
app.register(createQuestionRoute);
app.register(uploadAudioRoute);
app.register(uploadTextRoute);
app.register(userRoute);

app.listen({ port: env.PORT, host: env.HOST }).then(() => {
  // biome-ignore lint/suspicious/noConsole: server start!
  console.log(
    `Server running!\ncheck health: http://${env.HOST}:${env.PORT}/health`
  );
});
