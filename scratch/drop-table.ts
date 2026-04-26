import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function dropTable() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'divine',
  });
  await connection.execute('DROP TABLE IF EXISTS naam_jap');
  console.log('naam_jap dropped');
  await connection.end();
}

dropTable();
