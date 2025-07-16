import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import {
  createUserSchema,
  loginResponseSchema,
  loginSchema,
} from './schemas/user-routes-schema.ts';

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

  app.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: loginResponseSchema,
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          password: schema.user.password,
        })
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);

      if (!user[0].email) {
        return reply.code(401).send({
          message: 'Invalid email or password',
        });
      }

      const isMatch =
        user && (await bcrypt.compare(password, user[0].password));
      if (!isMatch) {
        return reply.code(401).send({
          message: 'Invalid email or password',
        });
      }
      const payload = {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      };
      const token = req.jwt.sign(payload);
      return { accessToken: token };
    }
  );
};
