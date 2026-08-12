import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StaffUser, { STAFF_ROLE_VALUES, StaffRole } from '../models/StaffUser';
import { requireAdmin, StaffAuthedRequest } from '../middleware/adminAuth';
import { sendStaffCredentials } from '../lib/mailer';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Admin login is not configured' });
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await StaffUser.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );

  res.json({ token, role: user.role, email: user.email });
});

router.get('/users', requireAdmin, async (_req, res) => {
  const users = await StaffUser.find().select('-passwordHash -__v').sort({ createdAt: -1 }).lean();
  res.json({ users });
});

router.post('/users', requireAdmin, async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body as {
    email?: string;
    password?: string;
    role?: StaffRole;
    firstName?: string;
    lastName?: string;
  };

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!(STAFF_ROLE_VALUES as string[]).includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLE_VALUES.join(', ')}` });
  }

  const existing = await StaffUser.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'A staff account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await StaffUser.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    firstName,
    lastName,
  });

  sendStaffCredentials({ to: user.email, firstName: user.firstName, role: user.role, password }).catch((err) =>
    console.error('[mailer] failed to send staff credentials email:', err instanceof Error ? err.message : err)
  );

  const { passwordHash: _unused, ...userObj } = user.toObject();
  res.status(201).json({ user: userObj });
});

router.patch('/users/:id/role', requireAdmin, async (req: StaffAuthedRequest, res) => {
  const { role } = req.body as { role?: StaffRole };
  if (!role || !(STAFF_ROLE_VALUES as string[]).includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${STAFF_ROLE_VALUES.join(', ')}` });
  }
  if (req.staffUser?.id === req.params.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  const user = await StaffUser.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.delete('/users/:id', requireAdmin, async (req: StaffAuthedRequest, res) => {
  if (req.staffUser?.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  const user = await StaffUser.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: 'Staff user not found' });
  res.status(204).end();
});

export default router;
