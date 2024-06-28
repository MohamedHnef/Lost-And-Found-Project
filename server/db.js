// db.js
const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release(); // release the connection back to the pool
});

module.exports = pool;
