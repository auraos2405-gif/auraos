import { z } from 'zod';

export const emailSchema = z.string().trim().email().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, 'A senha deve conter uma letra minúscula')
  .regex(/[A-Z]/, 'A senha deve conter uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter um número');

