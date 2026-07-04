import express from 'express';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { corsMiddleware } from './config/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);