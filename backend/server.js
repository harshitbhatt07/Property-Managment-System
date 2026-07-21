import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { seedAdmin } from './seedAdmin.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((value) => value.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.get('/api/health', (_, res) => res.json({ message: 'Property Management API is running.' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid resource ID.' });
  if (error.code === 11000) return res.status(409).json({ message: 'Duplicate value detected.' });
  res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Server error.' : error.message });
});

const PORT = process.env.PORT || 5000;
connectDatabase().then(async () => { await seedAdmin(); app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); }).catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
