import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import type { AuthTokenPayload } from '../types/auth.js';
import type { UserRole } from '../types/domain.js';

function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.role === 'string'
  );
}

export const authenticate = (allowedRoles?: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new HttpError(401, 'Authorization header missing or malformed');
      }

      const token = authorizationHeader.slice('Bearer '.length);
      const decoded = jwt.verify(token, env.JWT_SECRET);

      if (!isAuthTokenPayload(decoded)) {
        throw new HttpError(401, 'Invalid authentication token');
      }

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role as UserRole)) {
        throw new HttpError(403, 'You do not have permission to access this resource');
      }

      req.auth = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};