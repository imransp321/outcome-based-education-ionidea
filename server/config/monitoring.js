const client = require('prom-client');
require('dotenv').config();

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const dbConnectionsActive = new client.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

const dbConnectionsIdle = new client.Gauge({
  name: 'db_connections_idle',
  help: 'Number of idle database connections'
});

const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type']
});

const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type']
});

const activeUsers = new client.Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbConnectionsActive);
register.registerMetric(dbConnectionsIdle);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(activeUsers);

// Query metrics tracker
class QueryMetrics {
  constructor() {
    this.queryCount = 0;
    this.totalDuration = 0;
    this.slowQueries = 0;
  }

  recordQuery(duration, query, rowCount) {
    this.queryCount++;
    this.totalDuration += duration;
    
    if (duration > 1000) {
      this.slowQueries++;
    }

    // Extract table name from query
    const tableMatch = query.match(/FROM\s+(\w+)/i) || query.match(/UPDATE\s+(\w+)/i) || query.match(/INSERT\s+INTO\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : 'unknown';
    
    // Determine query type
    let queryType = 'SELECT';
    if (query.trim().toUpperCase().startsWith('INSERT')) queryType = 'INSERT';
    else if (query.trim().toUpperCase().startsWith('UPDATE')) queryType = 'UPDATE';
    else if (query.trim().toUpperCase().startsWith('DELETE')) queryType = 'DELETE';

    // Record metrics
    dbQueryDuration.labels(queryType, table).observe(duration / 1000);
  }

  getStats() {
    return {
      queryCount: this.queryCount,
      averageDuration: this.queryCount > 0 ? this.totalDuration / this.queryCount : 0,
      slowQueries: this.slowQueries,
      slowQueryPercentage: this.queryCount > 0 ? (this.slowQueries / this.queryCount) * 100 : 0
    };
  }
}

// Create global query metrics instance
global.queryMetrics = new QueryMetrics();

// Middleware for HTTP request metrics
const httpMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
};

// Database connection monitoring
const updateDbConnectionMetrics = (pool) => {
  setInterval(() => {
    dbConnectionsActive.set(pool.totalCount);
    dbConnectionsIdle.set(pool.idleCount);
  }, 5000); // Update every 5 seconds
};

// Cache metrics helpers
const recordCacheHit = (cacheType = 'default') => {
  cacheHits.labels(cacheType).inc();
};

const recordCacheMiss = (cacheType = 'default') => {
  cacheMisses.labels(cacheType).inc();
};

// Health check endpoint data
const getHealthData = () => {
  const queryStats = global.queryMetrics.getStats();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      queryCount: queryStats.queryCount,
      averageQueryTime: queryStats.averageDuration,
      slowQueries: queryStats.slowQueries,
      slowQueryPercentage: queryStats.slowQueryPercentage
    }
  };
};

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  dbQueryDuration,
  dbConnectionsActive,
  dbConnectionsIdle,
  cacheHits,
  cacheMisses,
  activeUsers,
  httpMetricsMiddleware,
  updateDbConnectionMetrics,
  recordCacheHit,
  recordCacheMiss,
  getHealthData
};
