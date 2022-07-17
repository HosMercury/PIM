const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isEmail, isNumeric } = require('validator');

const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
let conn;

router.get('/api/groups', async (req, res) => {
  try {
    let results = await pool.query(`select * from groups order by id desc`);
    return res.json(results);
  } catch (err) {
    // console.log(err);
    return res.status(400).send('error'); // error page
  }
});

// Get -- Attributes home page
router.get('/groups', async (req, res) => {
  try {
    // const groups = await pool.query('select * from groups order by id desc');

    return res.render('groups_index', {
      title: 'Groups',
      button: 'Create Group',
      buttonClass: 'create-group'
      // groups
    });
  } catch (err) {
    return res.status(400).render('error'); // error page
  }
});
module.exports = router;
