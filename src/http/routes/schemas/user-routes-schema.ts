import z from 'zod/v4';

export const createUserSchema = z.object({
  email: z.string(),
  password: z.string().min(6),
  name: z.string(),
});

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
});
