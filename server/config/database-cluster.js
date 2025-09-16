const { Pool } = require('pg');
require('dotenv').config();

// Master database pool (for writes)
const masterPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'obe_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 50,
  min: parseInt(process.env.DB_MIN_CONNECTIONS) || 5,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
  destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT) || 5000,
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL) || 1000,
  createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL) || 200,
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
});

// Slave database pool (for reads)
const slavePool = new Pool({
  host: process.env.DB_SLAVE_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.DB_SLAVE_PORT || process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'obe_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: parseInt(process.env.DB_SLAVE_MAX_CONNECTIONS) || 100,
  min: parseInt(process.env.DB_SLAVE_MIN_CONNECTIONS) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
  destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT) || 5000,
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL) || 1000,
  createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL) || 200,
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
});

// Connection pools array for load balancing
const pools = [masterPool, slavePool];
let currentPoolIndex = 0;

// Round-robin load balancer for read queries
const getReadPool = () => {
  currentPoolIndex = (currentPoolIndex + 1) % pools.length;
  return pools[currentPoolIndex];
};

// Test connections
const connect = async () => {
  try {
    // Test master connection
    const masterClient = await masterPool.connect();
    console.log('✅ Connected to PostgreSQL master database');
    masterClient.release();

    // Test slave connection
    const slaveClient = await slavePool.connect();
    console.log('✅ Connected to PostgreSQL slave database');
    slaveClient.release();

    return true;
  } catch (err) {
    console.error('❌ Error connecting to database cluster:', err);
    throw err;
  }
};

// Enhanced query function with read/write splitting
const query = async (text, params, options = {}) => {
  const start = Date.now();
  const queryId = Math.random().toString(36).substr(2, 9);
  const { useMaster = false, operation = 'read' } = options;
  
  // Determine which pool to use
  const pool = useMaster || operation === 'write' || operation === 'insert' || 
               operation === 'update' || operation === 'delete' ? masterPool : getReadPool();
  
  try {
    console.log(`[DB Query ${queryId}] ${operation.toUpperCase()} query on ${pool === masterPool ? 'MASTER' : 'SLAVE'}: ${text.substring(0, 100)}...`);
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (> 1000ms)
    if (duration > 1000) {
      console.warn(`[DB Query ${queryId}] Slow query detected: ${duration}ms - ${text.substring(0, 100)}...`);
    } else {
      console.log(`[DB Query ${queryId}] Query completed in ${duration}ms`);
    }
    
    // Track query metrics
    if (global.queryMetrics) {
      global.queryMetrics.recordQuery(duration, text, res.rowCount, operation);
    }
    
    return res;
    
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DB Query ${queryId}] Query failed after ${duration}ms:`, err.message);
    
    // If slave query fails, retry on master
    if (pool === slavePool && !useMaster) {
      console.log(`[DB Query ${queryId}] Retrying failed slave query on master...`);
      return query(text, params, { ...options, useMaster: true });
    }
    
    throw err;
  }
};

// Transaction helper (always uses master)
const transaction = async (callback) => {
  const client = await masterPool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Health check for both pools
const healthCheck = async () => {
  const health = {
    master: { status: 'unknown', responseTime: 0 },
    slave: { status: 'unknown', responseTime: 0 },
    overall: 'unknown'
  };

  try {
    // Check master
    const masterStart = Date.now();
    const masterClient = await masterPool.connect();
    await masterClient.query('SELECT 1');
    masterClient.release();
    health.master = {
      status: 'healthy',
      responseTime: Date.now() - masterStart
    };
  } catch (err) {
    health.master = {
      status: 'unhealthy',
      error: err.message
    };
  }

  try {
    // Check slave
    const slaveStart = Date.now();
    const slaveClient = await slavePool.connect();
    await slaveClient.query('SELECT 1');
    slaveClient.release();
    health.slave = {
      status: 'healthy',
      responseTime: Date.now() - slaveStart
    };
  } catch (err) {
    health.slave = {
      status: 'unhealthy',
      error: err.message
    };
  }

  // Determine overall health
  if (health.master.status === 'healthy') {
    health.overall = 'healthy';
  } else if (health.slave.status === 'healthy') {
    health.overall = 'degraded';
  } else {
    health.overall = 'unhealthy';
  }

  return health;
};

// Connection pool monitoring
const getPoolStats = () => {
  return {
    master: {
      totalCount: masterPool.totalCount,
      idleCount: masterPool.idleCount,
      waitingCount: masterPool.waitingCount
    },
    slave: {
      totalCount: slavePool.totalCount,
      idleCount: slavePool.idleCount,
      waitingCount: slavePool.waitingCount
    }
  };
};

// Graceful shutdown
const close = async () => {
  console.log('Closing database connections...');
  await Promise.all([
    masterPool.end(),
    slavePool.end()
  ]);
  console.log('Database connections closed');
};

module.exports = {
  masterPool,
  slavePool,
  connect,
  query,
  transaction,
  healthCheck,
  getPoolStats,
  close
};
