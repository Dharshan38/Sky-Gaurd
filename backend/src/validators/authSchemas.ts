import { z } from 'zod';
import type { UserRole } from '../types/domain.js';

export const registerSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['FLEET_MANAGER', 'MAINTENANCE_TECH'] satisfies [UserRole, UserRole]).optional().default('FLEET_MANAGER')
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required')
});