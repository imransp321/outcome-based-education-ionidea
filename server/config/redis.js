const { createClient } = require('redis');
require('dotenv').config();

// Redis client configuration
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Connect to Redis
redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

redisClient.on('error', (err) => {
  // Silently ignore Redis errors for development
  // Don't log anything to avoid console spam
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

// Cache helper functions
const cache = {
  // Set cache with TTL
  async set(key, value, ttl = 3600) {
    try {
      if (!redisClient.isOpen) {
        return false; // Redis not connected, skip caching
      }
      const serializedValue = JSON.stringify(value);
      if (ttl > 0) {
        await redisClient.setEx(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.warn('Redis set error (skipping cache):', error.message);
      return false;
    }
  },

  // Get cache
  async get(key) {
    try {
      if (!redisClient.isOpen) {
        return null; // Redis not connected, return null
      }
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Redis get error (skipping cache):', error.message);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  },

  // Delete multiple keys
  async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  },

  // Get TTL
  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }
};

// Cache middleware for Express routes
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Check if data exists in cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(body) {
        // Cache the response
        cache.set(cacheKey, body, duration).catch(err => {
          console.error('Cache set error:', err);
        });
        
        // Call original json method
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = {
  redisClient,
  cache,
  cacheMiddleware
};
