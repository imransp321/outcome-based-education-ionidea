const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const db = require('./config/database-cluster');
const { redisClient, cache, cacheMiddleware } = require('./config/redis');
const { 
  httpMetricsMiddleware, 
  updateDbConnectionMetrics, 
  getHealthData,
  register 
} = require('./config/monitoring');
const configRoutes = require('./routes/config');
const facultyRoutes = require('./routes/faculty');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable compression
app.use(compression());

// Performance monitoring middleware
app.use(httpMetricsMiddleware);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "http://127.0.0.1:5000"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"],
    },
  },
}));

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || (process.env.NODE_ENV === 'production' ? 1000 : 10000), // Higher limits for production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/metrics';
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', cors());

// Debug middleware for development - removed verbose logging

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (moved after CORS)
app.use('/uploads', express.static('uploads'));

// Initialize Redis connection (optional for development)
// Skip Redis connection in development to avoid error messages
if (process.env.NODE_ENV === 'production') {
  redisClient.connect().catch(err => {
    console.warn('Redis not available (continuing without cache):', err.message);
  });
}

// Test database cluster connection
db.connect()
  .then(() => {
    // Start database connection monitoring for both pools
    updateDbConnectionMetrics(db.masterPool);
    updateDbConnectionMetrics(db.slavePool);
  })
  .catch(err => {
    console.error('Database cluster connection failed:', err);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = getHealthData();
  res.json(healthData);
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Routes
app.use('/api/config', configRoutes);
app.use('/api/faculty', facultyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  // Server started successfully
});

