import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/authSchemas.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);