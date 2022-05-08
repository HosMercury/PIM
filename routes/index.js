const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool();

router.get('/', (req, res) => {
  pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
  });
  res.render('pages/index');
});

// define the home page route
router.get('/login', (req, res) => {
  console.login(query('1+1'));
  res.render('pages/login');
});

module.exports = router;
