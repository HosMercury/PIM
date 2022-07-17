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

// Get -- Attributes home page
router.post('/groups', async (req, res) => {
  const errs = [];
  const { name, description } = req.body;

  ///////////////// Name validation ////////////////////
  if (typeof name !== 'undefined') {
    if (name.length < 2) errs.push('Name field minimum length is 2 letters');
    if (name.length > 250)
      errs.push('Name field maximum length is 250 letters');
    if (name.search(alphaDashNumeric) === -1)
      errs.push(
        'Name field must contains only letters, numbers, space, dash or underscore'
      );
  } else errs.push('Name field is required');

  //////////  Description //////////////
  if (typeof description !== 'undefined') {
    if (description !== '' && description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description !== '' && description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }

  if (errs.length > 0) {
    req.session.redirector = 'group';
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }

  try {
    await pool.query('insert into groups (name, description) values(?,?)', [
      name,
      description
    ]);

    req.session.msg = 'Group saved successfully';

    return res.redirect('back');
  } catch (err) {
    return res.status(400).render('error'); // error page
  }
});

module.exports = router;
