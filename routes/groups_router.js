const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isNumeric } = require('validator');
const validateGroup = require('./validation/group');

router.get('/api/groups', async (req, res) => {
  try {
    let results = await pool.query(`
      select g.* ,
      JSON_ARRAYAGG(JSON_OBJECT('id', a.id,'name', a.name)) as attributes,
      (select cast(count(*) as char) from attribute_groups ag where ag.group_id = g.id) attributes_count
      from groups g
      left join attribute_groups ag on g.id = ag.group_id
      left join attributes a on a.id = ag.attribute_id
      group by g.id order by g.id desc
    `);
    return res.json(results);
  } catch (err) {
    // console.log(err);
    return res.status(400).send('error'); // error page
  }
});

// Get -- Attributes home page
router.get('/groups', async (req, res) => {
  try {
    return res.render('groups/index', {
      title: 'Groups',
      button: 'Create Group',
      buttonClass: 'create-group'
      // groups
    });
  } catch (err) {
    req.session.err = 'Error happened while fetching the groups';
    return res.status(400).redirect('back');
  }
});

// Get -- Attributes home page
router.post('/groups', async (req, res) => {
  let { id, name, description } = req.body;
  const errs = validateGroup(name, description);

  if (id !== '' && !isNumeric(id)) {
    errs.push('Invalid id');
  }

  if (errs.length > 0) {
    req.session.redirector = 'group';
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }

  /// Edit group ////
  try {
    if (isNumeric(id)) {
      const editQuery = `update groups set name = ?,description = ? where id = ?`;
      await pool.query(editQuery, [name, description, id]);
    } else {
      await pool.query('insert into groups (name, description) values(?,?)', [
        name,
        description
      ]);
    }
    req.session.msg = 'Group saved successfully';
    return res.redirect('back');
  } catch (err) {
    console.log(err);
    req.session.redirector = 'group';
    req.session.errs = ['Error happened while saving the group'];
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
});

module.exports = router;
