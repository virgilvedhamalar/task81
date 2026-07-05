import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db';
import { seedMongooseAdmin } from './server/models/User';
import { seedMongooseProducts } from './server/models/Product';

import authRoutes from './server/routes/authRoutes';
import userRoutes from './server/routes/userRoutes';
import adminRoutes from './server/routes/adminRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Database Connection
const initDatabase = async () => {
  const isRealMongoConnected = await connectDB();
  if (isRealMongoConnected) {
    // Seed real MongoDB tables if connected
    await seedMongooseAdmin();
    await seedMongooseProducts();
  }
};
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Database and Server telemetry status route
app.get('/api/status', (req, res) => {
  const isConnected = require('./server/config/db').getDBStatus();
  res.json({
    success: true,
    status: 'ONLINE',
    databaseMode: isConnected ? 'Mongoose (MongoDB Cloud)' : 'Local Fallback JSON Store',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Serve frontend static files from the client directory
const CLIENT_DIR = path.join(process.cwd(), 'client');
app.use(express.static(CLIENT_DIR));

// Direct catch-all routes to index.html for smooth SPA navigation fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// Boot Server on Port 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log('===================================================');
  console.log(`🚀 RBAC Secure Server running on port ${PORT}`);
  console.log(`🌐 Development App URL: http://localhost:${PORT}`);
  console.log('===================================================');
});
