import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { fleetRouter } from './fleetRoutes.js';
import { telemetryRouter } from './telemetryRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/fleet', fleetRouter);
apiRouter.use('/telemetry', telemetryRouter);