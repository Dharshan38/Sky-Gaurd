import { z } from 'zod';

export const aircraftAnalyticsParamsSchema = z.object({
  tailNumber: z.string().trim().min(1).transform((value) => value.toUpperCase())
});

export const aircraftAnalyticsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100)
});