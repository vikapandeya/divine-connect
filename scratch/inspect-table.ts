import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function inspectTable() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'divine',
  });
  const [rows] = await connection.execute('DESCRIBE users');
  console.log('Users Table Schema:', rows);
  await connection.end();
}

inspectTable();
