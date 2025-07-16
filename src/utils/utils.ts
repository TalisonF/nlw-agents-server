import type { JWT } from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT;
  }
  export interface FastifyInstance {
    // biome-ignore lint/suspicious/noExplicitAny: not type
    authenticate: any;
  }
}
type UserPayload = {
  id: string;
  email: string;
  name: string;
};
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload;
  }
}
