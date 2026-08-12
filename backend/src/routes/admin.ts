import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.JWT_SECRET;

  if (!adminPassword || !secret) {
    return res.status(500).json({ error: 'Admin login is not configured' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
