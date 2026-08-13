import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface StudentAuthedRequest extends Request {
  student?: { id: string; email: string };
}

interface StudentJwtPayload {
  sub: string;
  email: string;
}

export function requireStudent(req: StudentAuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new Error('Missing token');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const payload = jwt.verify(token, secret) as StudentJwtPayload;
    req.student = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
