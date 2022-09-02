const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const pool = require('../config/db_pool');
const {
  generateValidationErrorsResponse,
  generateValGeneralErrorResponse
} = require('../routes/errs');

const alphaDashNumeric = /^[a-zA-Z0-9-_]+$/;

function validateCredentials(username, password, remember) {
  const errs = [];

  if (typeof username === 'undefined') errs.push('Username is required');

  if (username.search(alphaDashNumeric) === -1) {
    errs.push(
      'Username field must contains only letters, numbers, dash and underscore'
    );
  }

  if (typeof password === 'undefined') errs.push('Password is required');

  if (typeof username !== 'undefined' && username.length < 5)
    errs.push('Username must be at least 5 letters');

  if (typeof password !== 'undefined' && password.length < 5)
    errs.push('Password must be at least 5 letters');

  if (typeof username !== 'undefined' && username.length > 50)
    errs.push('Username maximum 50 letters');

  if (typeof password !== 'undefined' && password.length > 100)
    errs.push('Password maximum 100 letters');

  if (typeof remember !== 'boolean') errs.push('Invalid remember value');

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

// POST
router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;
  const errs = validateCredentials(username, password, remember);

  if (errs.length > 0) return generateValidationErrorsResponse(errs, res);

  const user = await authenticateUser(username, password); // Returns user or null

  if (user) {
    req.session.user = user;
    if (remember) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    delete req.session.user.password;

    return res.status(200).json(req.session.user);
  }

  // invalid credentials
  return generateValGeneralErrorResponse(res, 'Please check your credentials');
});

router.get('/me', (req, res) => {
  try {
    return res.status(200).json(req.session.user).end();
  } catch (e) {
    return generateValGeneralErrorResponse(res);
  }
});

router.post('/logout', (req, res) => {
  req.session.user = null;
  res.clearCookie('sid', { path: '/' });

  req.session.destroy((err) => {
    if (err) {
      return res.status(400).end();
    } else {
      return res.status(200).end();
    }
  });
});

module.exports = router;
