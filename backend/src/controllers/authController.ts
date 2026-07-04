import type { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import type { UserRole } from '../types/domain.js';

const passwordRounds = 12;

const buildUserProfile = (user: {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const createToken = (user: { id: string; email: string; role: UserRole }) => {
  const expiresIn: Exclude<jwt.SignOptions['expiresIn'], undefined> = env.JWT_EXPIRES_IN as Exclude<
    jwt.SignOptions['expiresIn'],
    undefined
  >;
  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    options
  );
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, role } = req.body as {
      email: string;
      password: string;
      role: UserRole;
    };

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new HttpError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, passwordRounds);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role
      }
    });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: buildUserProfile(user)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = createToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: buildUserProfile(user)
      }
    });
  } catch (error) {
    next(error);
  }
};