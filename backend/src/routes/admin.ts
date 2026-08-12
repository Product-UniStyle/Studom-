import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;

  if (!adminEmail || !adminPassword || !secret) {
    return res.status(500).json({ error: 'Admin login is not configured' });
  }

  if (email?.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
