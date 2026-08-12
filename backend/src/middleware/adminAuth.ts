import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StaffRole } from '../models/StaffUser';

export interface StaffAuthedRequest extends Request {
  staffUser?: { id: string; email: string; role: StaffRole };
}

interface StaffJwtPayload {
  sub: string;
  email: string;
  role: StaffRole;
}

function verifyStaffToken(req: Request): StaffJwtPayload {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) throw new Error('Missing token');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');

  return jwt.verify(token, secret) as StaffJwtPayload;
}

export function requireEditorOrAdmin(req: StaffAuthedRequest, res: Response, next: NextFunction) {
  try {
    const payload = verifyStaffToken(req);
    if (payload.role !== 'admin' && payload.role !== 'editor') {
      return res.status(403).json({ error: 'Editor or admin access required' });
    }
    req.staffUser = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: StaffAuthedRequest, res: Response, next: NextFunction) {
  try {
    const payload = verifyStaffToken(req);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.staffUser = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
