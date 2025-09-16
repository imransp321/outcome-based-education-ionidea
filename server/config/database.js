const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'obe_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 100, // Increased from 20
  min: parseInt(process.env.DB_MIN_CONNECTIONS) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT) || 30000,
  destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT) || 5000,
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL) || 1000,
  createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL) || 200,
  // Enable statement timeout
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
  // Enable query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
});

// Test connection
const connect = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();
    return true;
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
};

// Query helper function with performance monitoring
const query = async (text, params) => {
  const start = Date.now();
  const queryId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`[DB Query ${queryId}] Starting query: ${text.substring(0, 100)}...`);
    
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
      global.queryMetrics.recordQuery(duration, text, res.rowCount);
    }
    
    return res;
    
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DB Query ${queryId}] Query failed after ${duration}ms:`, err.message);
    throw err;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
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

module.exports = {
  pool,
  connect,
  query,
  transaction
};

