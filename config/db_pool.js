const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // connectionLimit: 10,
  charset: 'utf8mb4'
});

async function asyncFunction() {
  console.log('process.env', process.env);
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT 1 as val');
    console.log(rows); //[ {val: 1}, meta: ... ]
    // const res = await conn.query('INSERT INTO myTable value (?, ?)', [
    //   1,
    //   'mariadb'
    // ]);
    // console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

// asyncFunction();

module.exports = pool;
