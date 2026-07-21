import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { User } from './models.js';

export const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const name = process.env.ADMIN_NAME || 'System Admin';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.role = 'admin';
    existing.approvalStatus = 'approved';
    existing.password = await bcrypt.hash(password, 12);
    await existing.save();
    console.log('Admin user updated:', email);
    return;
  }

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: 'admin',
    approvalStatus: 'approved',
  });
  console.log('Admin user created:', email);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      await seedAdmin();
      await mongoose.disconnect();
    })
    .catch((error) => {
      console.error('Admin seed failed:', error.message);
      process.exit(1);
    });
}
