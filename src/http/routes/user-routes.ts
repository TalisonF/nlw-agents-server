import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { createUserSchema } from './schemas/user-routes-schema.ts';

export const userRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/user/register',
    {
      schema: {
        body: createUserSchema,
      },
    },
    async (req, reply) => {
      const { password, email, name } = req.body;
      const user = await db
        .select({ email: schema.user.email })
        .from(schema.user)
        .where(eq(schema.user.email, email));
      if (user[0]) {
        return reply.code(401).send({
          message: 'User already exists with this email',
        });
      }
      try {
        const hash = await bcrypt.hash(password, 10);
        const newUser = await db
          .insert(schema.user)
          .values({
            email,
            name,
            password: hash,
          })
          .returning();
        reply.status(201).send(newUser);
      } catch (e) {
        reply.code(500).send(e);
      }
    }
  );

  app.post('/login', {}, (_request, reply) =>
    reply.status(200).send({
      messsage: 'login',
    })
  );

  app.delete('/logout', {}, (_request, reply) =>
    reply.status(200).send({
      messsage: 'logout',
    })
  );
};
