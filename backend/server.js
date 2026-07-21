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
const PORT = process.env.PORT || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://localhost:5173,https://property-managment-system-six.vercel.app'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Property Management API is running.',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Property Management API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID.',
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate value detected.',
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Server error.'
        : error.message,
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    await seedAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();