import { Router } from 'express';
import { getAircraftAnalytics, getDashboardSummary } from '../controllers/fleetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aircraftAnalyticsParamsSchema, aircraftAnalyticsQuerySchema } from '../validators/fleetSchemas.js';

export const fleetRouter = Router();

fleetRouter.use(authenticate());

fleetRouter.get('/dashboard-summary', getDashboardSummary);
fleetRouter.get(
  '/aircraft/:tailNumber/analytics',
  validate({
    params: aircraftAnalyticsParamsSchema,
    query: aircraftAnalyticsQuerySchema
  }),
  getAircraftAnalytics
);