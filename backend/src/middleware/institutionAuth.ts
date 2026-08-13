import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface InstitutionAuthedRequest extends Request {
  institution?: { id: string; email: string; universityId: string };
}

interface InstitutionJwtPayload {
  sub: string;
  email: string;
  universityId: string;
}

export function requireInstitution(req: InstitutionAuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new Error('Missing token');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const payload = jwt.verify(token, secret) as InstitutionJwtPayload;
    req.institution = { id: payload.sub, email: payload.email, universityId: payload.universityId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
