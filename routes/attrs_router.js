const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');

router.get('/', (req, res) => {
  return res.render('index', {
    title: 'Dashboard'
  });
});

router.get('/attributes', async (req, res) => {
  try {
    const locals = await pool.query(
      'select language, abbreviation, direction from locals'
    );

    return res.render('attributes/index', {
      title: 'Attributes',
      button: 'Create attribute',
      buttonClass: 'create-attribute',
      locals
    });
  } catch (err) {
    return res.render('error');
  }
});

router.post('/attributes', async (req, res) => {
  res.json(req.body);
});

module.exports = router;
