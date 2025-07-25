import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  HOST: z.coerce.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_URL: z.string(),
  GEMINI_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
