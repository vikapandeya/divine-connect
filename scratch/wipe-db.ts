import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function wipeDB() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'divine',
  });
  
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await connection.execute('SHOW TABLES');
  for (const table of (tables as any[])) {
    const tableName = Object.values(table)[0] as string;
    await connection.execute('DROP TABLE IF EXISTS ' + tableName);
    console.log('Dropped ' + tableName);
  }
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Database wiped.');
  await connection.end();
}

wipeDB();
