import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { Types } from 'mongoose';

const generateToken = (res: Response, userId: Types.ObjectId): void => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not defined');

  const expire = (process.env['JWT_EXPIRE'] ?? '7d') as jwt.SignOptions['expiresIn'];
  const token = jwt.sign({ id: userId.toString() }, secret, { expiresIn: expire });

  const isProd = process.env['NODE_ENV'] === 'production';
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProd,           // HTTPS only in production
    sameSite: isProd ? 'none' : 'strict', // 'none' required for cross-origin in prod
    maxAge,
  });
};

export default generateToken;
