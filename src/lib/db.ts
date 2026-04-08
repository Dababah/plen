import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3308'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'planlife_finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };
export default pool;
