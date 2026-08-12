import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import StaffUser from './models/StaffUser';
import mongoose from 'mongoose';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD must be set in .env to seed the first admin');
  }

  await connectDB();

  const existing = await StaffUser.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`StaffUser ${email} already exists (role: ${existing.role}) — nothing to do.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await StaffUser.create({ email: email.toLowerCase(), passwordHash, role: 'admin' });
    console.log(`Created admin StaffUser: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
