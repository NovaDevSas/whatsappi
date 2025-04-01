import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getConnectionPool() {
  if (!pool) {
    try {
      // Create connection pool with environment variables from .env
      const user = process.env.DB_USER || '';
      const host = process.env.DB_SERVER || '';
      const database = process.env.DB_NAME || '';
      const password = process.env.DB_PASSWORD || '';
      const port = parseInt(process.env.DB_PORT || '5432');
      
      // Log connection details (without password) for debugging
      console.log(`Connecting to PostgreSQL: ${user}@${host}:${port}/${database}`);
      
      pool = new Pool({
        user,
        host,
        database,
        password, 
        port,
        // Disable SSL for local development
        ssl: false
      });
      
      // Test the connection
      const client = await pool.connect();
      console.log('Database connection established successfully');
      client.release();
    } catch (error) {
      console.error('Error establishing database connection:', error);
      pool = null;
      throw error;
    }
  }
  return pool;
}