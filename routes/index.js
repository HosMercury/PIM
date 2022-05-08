const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool();

router.get('/', (req, res) => {
  req.session.user = 'Hossam Maher';
  res.render('pages/index', { name: req.session.user });
});

// define the home page route
router.get('/login', (req, res) => {
  console.login(query('1+1'));
  res.render('pages/login');
});

module.exports = router;
