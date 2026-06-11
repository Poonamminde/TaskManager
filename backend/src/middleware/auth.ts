import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { IUser } from '../models/User';

// ── Augment Express Request to carry authenticated user ───────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  id: string;
}

// ── protect ───────────────────────────────────────────────────────────────────
// Verifies JWT from cookie (or Authorization header as fallback) and attaches
// the authenticated user to req.user.
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // 1️⃣ Prefer HTTP-only cookie
  if (req.cookies?.jwt) {
    token = req.cookies.jwt as string;
  }
  // 2️⃣ Fallback: Bearer token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized — no token provided' });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'];
    if (!secret) throw new Error('JWT_SECRET is not defined');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized — token invalid or expired' });
  }
};
