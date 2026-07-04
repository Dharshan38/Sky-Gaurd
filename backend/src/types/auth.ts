import type { UserRole } from './domain.js';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}