const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAlphanumeric } = require('validator');
const { isEmpty } = require('lodash');

function validateCredentials(username, password) {
  const errs = [];

  if (isEmpty(username)) errs.push({ username: 'Username is required' });

  if (isEmpty(password)) errs.push({ password: 'password is required' });

  if (!isAlphanumeric(username))
    errs.push({ username: 'Only letters and numbers are allowed' });

  if (!isAlphanumeric(password))
    errs.push({ password: 'Only letters and numbers are allowed' });

  if (username.length < 5)
    errs.push({ username: 'Username must be at least 5 letters' });

  if (password.length < 5)
    errs.push({ password: 'Password must be at least 5 letters' });

  if (username.length > 50)
    errs.push({ username: 'Username maximum 50 letters' });

  if (password.length > 100)
    errs.push({ username: 'Password maximum 100 letters' });

  return errs;
}

async function authenticateUser(username, password) {
  try {
    const {
      rows: [user]
    } = await pool.query(`SELECT * FROM "users" WHERE username = $1 LIMIT 1`, [
      username
    ]);

    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    return validPassword ? user : null;
  } catch (e) {
    return null;
  }
}

// GET
router.get('/login', (req, res) => {
  return res.render('login');
});

router.get('/dashboard', (req, res) => {
  return res.send('dashboard page');
});

// POST
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const errs = validateCredentials(username, password);

  if (errs.length === 0) {
    const user = await authenticateUser(username, password);

    if (user != null) {
      req.session.user = user;
      return res.redirect('/dashboard');
    }
    errs.push({ general: 'Please check your credentials' });
  }

  req.session.errs = errs;
  req.session.data = [username];

  return res.redirect('back');
});

router.get('/logout', async (req, res) => {
  req.session.destroy();
  return res.redirect('/login');
});

module.exports = router;
