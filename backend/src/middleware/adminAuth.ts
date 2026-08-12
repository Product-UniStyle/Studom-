import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminAuthedRequest extends Request {
  admin?: { role: 'admin' };
}

export function requireAdmin(req: AdminAuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    const payload = jwt.verify(token, secret) as { role?: string };
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Not an admin token' });
    }
    req.admin = { role: 'admin' };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}
