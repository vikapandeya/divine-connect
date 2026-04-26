import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      port: Number(process.env.MYSQL_PORT) || 3306,
    });

    console.log('✅ Connection to MySQL successful.');
    
    const [rows]: any = await connection.execute(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.MYSQL_DATABASE || 'divine'}'`);
    
    if (rows.length > 0) {
      console.log(`✅ Database '${process.env.MYSQL_DATABASE || 'divine'}' exists.`);
    } else {
      console.log(`❌ Database '${process.env.MYSQL_DATABASE || 'divine'}' does NOT exist. Creating it...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || 'divine'}`);
      console.log(`✅ Database '${process.env.MYSQL_DATABASE || 'divine'}' created.`);
    }
    
    await connection.end();
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
