const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const pool = require('../config/db_pool');
const { isAlphanumeric } = require('validator');
const { isEmpty } = require('lodash');

// if (!isAlphanumeric(username))
//   errs.push('Username:  Only letters and numbers are allowed');

// if (!isAlphanumeric(password))
//   errs.push('Password: Only letters and numbers are allowed');

function validateCredentials(username, password) {
  const errs = [];

  if (isEmpty(username)) errs.push('Username is required');

  if (isEmpty(password)) errs.push('Password is required');

  if (username.length < 5) errs.push('Username must be at least 5 letters');

  if (password.length < 5) errs.push('Password must be at least 5 letters');

  if (username.length > 50) errs.push('Username maximum 50 letters');

  if (password.length > 100) errs.push('Password maximum 100 letters');

  return errs;
}

async function authenticateUser(username, password) {
  try {
    const results = await pool.query(
      `SELECT * FROM users WHERE username = ? LIMIT 1`,
      [username]
    );

    const user = results[0];
    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    return validPassword ? user : null;
  } catch (e) {
    // console.log(e);
    return null;
  }
}

// GET
router.get('/login', (req, res) => {
  return res.render('login', { layout: false });
});

// POST
router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;
  const errs = validateCredentials(username, password, remember);

  if (errs.length === 0) {
    const user = await authenticateUser(username, password); // Returns user or null

    if (user != null) {
      req.session.user = user;
      if (remember === 'true')
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      return res.redirect('/');
    }
    errs.push('Please check your credentials');
  }

  req.session.errs = errs;
  req.session.old = { username, remember };

  return res.redirect('back');
});

router.post('/logout', async (req, res) => {
  req.session.destroy();
  return res.redirect('/login');
});

module.exports = router;
