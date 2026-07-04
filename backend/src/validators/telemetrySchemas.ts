import { z } from 'zod';

export const telemetryIngestSchema = z
  .object({
    aircraftId: z.string().cuid().optional(),
    tailNumber: z.string().trim().min(1).transform((value) => value.toUpperCase()).optional(),
    flightNumber: z.string().trim().min(1),
    engineTemperature: z.coerce.number(),
    oilPressure: z.coerce.number(),
    vibrationLevel: z.coerce.number(),
    altitude: z.coerce.number(),
    timestamp: z.coerce.date().optional()
  })
  .refine((payload) => Boolean(payload.aircraftId || payload.tailNumber), {
    message: 'Either aircraftId or tailNumber is required',
    path: ['aircraftId']
  });