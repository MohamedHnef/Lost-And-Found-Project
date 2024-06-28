// db.js
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: '148.66.138.145',
  user: 'dbusrShnkr24',
  password: 'studDBpwWeb2!',
  database: 'dbShnkr24stud'
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
