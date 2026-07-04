import { Router } from 'express';
import { ingestTelemetry } from '../controllers/telemetryController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { telemetryIngestSchema } from '../validators/telemetrySchemas.js';

export const telemetryRouter = Router();

telemetryRouter.use(authenticate());

telemetryRouter.post('/ingest', validate({ body: telemetryIngestSchema }), ingestTelemetry);