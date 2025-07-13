const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // blank for XAMPP default
  database: 'printify_pro'
});

module.exports = pool;
