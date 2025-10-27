const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const slotsRoutes = require('./routes/slots');
const bookingsRoutes = require('./routes/bookings');
const accountRoutes = require('./routes/account');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - REGISTERED ONLY ONCE
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/account', accountRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    app: process.env.APP_NAME || 'P2P Tutoring Scheduler',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// Debug routes (optional - remove in production)
console.log('📋 Registered routes:');
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`  ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((nestedRoute) => {
      if (nestedRoute.route) {
        const basePath = r.regexp.source
          .replace('\\/?(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\$/g, '');
        console.log(`  ${Object.keys(nestedRoute.route.methods)[0].toUpperCase()} ${basePath}${nestedRoute.route.path}`);
      }
    });
  }
});

// 404 handler - MUST be after all routes
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ${process.env.APP_NAME || 'Server'} running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});