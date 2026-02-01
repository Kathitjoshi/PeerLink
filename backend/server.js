const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE SETUP =====

// CORS Configuration - CRITICAL for frontend-backend communication
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(null, true); // Allow all in development, remove in production
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== DATABASE CONNECTION =====
const pool = require('./config/database');

// Load schema on startup
const fs = require('fs');
const path = require('path');

async function loadSchema() {
  try {
    const schemaPath = path.join(__dirname, 'models', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Schema loaded successfully');
  } catch (error) {
    // Schema might already exist, which is fine
    if (!error.message.includes('already exists')) {
      console.error('⚠️ Schema loading note:', error.message);
    }
  }
}

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const slotsRoutes = require('./routes/slots');
const bookingsRoutes = require('./routes/bookings');
const accountRoutes = require('./routes/account');

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/account', accountRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: process.env.APP_NAME || 'PeerLink',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Peer-to-Peer Learning Scheduler Platform',
    status: 'running'
  });
});

// List all registered routes (helpful for debugging)
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/');
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json(routes);
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    
    // Load schema
    await loadSchema();
    
    // Start server - IMPORTANT: Bind to 0.0.0.0 for Koyeb
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 PeerLink running on port', PORT);
      console.log('📍 http://localhost:' + PORT);
      console.log('🏥 Health check: http://localhost:' + PORT + '/api/health');
      console.log('📋 Routes list: http://localhost:' + PORT + '/api/routes');
      console.log('🌍 Environment:', process.env.NODE_ENV);
      console.log('🔗 Frontend URL:', process.env.FRONTEND_URL);
      console.log('='.repeat(50) + '\n');
      
      // Log registered routes
      console.log('📋 Registered routes:');
      const routes = [];
      app._router.stack.forEach(middleware => {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
          console.log(`  ${methods} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          middleware.handle.stack.forEach(handler => {
            if (handler.route) {
              const methods = Object.keys(handler.route.methods).map(m => m.toUpperCase()).join(', ');
              const basePath = middleware.regexp.source
                .replace('\\/?', '')
                .replace('(?=\\/|$)', '')
                .replace(/\\\//g, '/');
              console.log(`  ${methods} ${basePath}${handler.route.path}`);
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
