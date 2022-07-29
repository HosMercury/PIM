const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validateGroup = require('../validation/group');
const moment = require('moment');

let conn;

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

// Get -- Group show
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

// DElete -- group
router.post('/groups/:id/delete', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query(`delete from groups where id = ?`, [id]);

    req.session.msg = 'Group deleted successfully';
    return res.redirect('/groups');
  } catch (err) {
    // console.log(err);
    req.session.err = 'Error happened while deleting the group';
    return res.status(400).redirect('back');
  }
});

// Get -- groups home page
router.get('/groups/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const results = await pool.query(
      `
      select g.* ,
      JSON_ARRAYAGG(JSON_OBJECT('id', a.id,'name', a.name)) as attributes
      from groups g 
      left join attribute_groups ag on g.id = ag.group_id 
      left join attributes a on a.id = ag.attribute_id 
      where g.id = ? 
    `,
      [id]
    );

    if (results.length < 1) throw new Error('invalid group');
    const group = results[0];

    const all_attributes = await pool.query(
      `select id, name from attributes order by name asc`
    );

    group.attributes = group.attributes.filter((attribute) => attribute.id);

    const group_attrs_ids = group.attributes.map((attribute) => attribute.id);

    return res.render('groups/show', {
      title: 'Group : ' + group.name,
      group,
      all_attributes,
      group_attrs_ids,
      moment
    });
  } catch (err) {
    // console.log(err);
    req.session.err = 'Error happened while fetching the group';
    return res.status(400).redirect('back');
  }
});

// post -- group
router.post('/groups', async (req, res) => {
  const { name, description } = req.body;
  const errs = await validateGroup(name, description);

  // console.log(errs);

  if (errs.length > 0) {
    req.session.redirector = 'group';
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }

  /// Edit group ////
  try {
    await pool.query('insert into groups (name, description) values(?,?)', [
      name,
      description
    ]);

    req.session.msg = 'Group saved successfully';
    return res.redirect('back');
  } catch (err) {
    // console.log(err);
    req.session.redirector = 'group';
    req.session.err = ['Error happened while saving the group'];
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
});

router.post('/groups/:id/edit', async (req, res) => {
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const { name, description } = req.body;
    const id = req.params.id; // group id

    const sent_attrs_ids = req.body.attributes || [];

    const errs = await validateGroup(name, description, id);

    if (errs.length > 0) {
      req.session.redirector = 'group';
      req.session.errs = errs;
      req.session.old = req.body;
      return res.status(400).redirect('back');
    }

    // Validate sent groups ids
    let all_attributes_ids = await pool.query(
      `select JSON_ARRAYAGG(id) attributes from attributes`
    );

    // if all_attributes_ids the value of all_attributes_ids[0.attributes IS NULL]
    all_attributes_ids = all_attributes_ids[0].attributes;

    if (all_attributes_ids && sent_attrs_ids.length > 0) {
      sent_attrs_ids.map((attribute) => {
        if (!all_attributes_ids.includes(parseInt(attribute))) {
          req.session.err = ['Invalid attribute'];
          return res.status(400).redirect('back');
        }
      });
    }

    const results = await conn.batch(
      `update groups set name = ? ,description = ? where id = ?`,
      [name, description, id]
    );

    await conn.batch(`delete from attribute_groups where group_id = ?`, [id]);

    if (sent_attrs_ids.length > 0) {
      const values = sent_attrs_ids.map((attribute_id) => [id, attribute_id]);
      await conn.batch(
        `insert into attribute_groups (group_id, attribute_id) values (?, ?)`,
        values
      );
    }

    await conn.commit();
    req.session.msg = 'Group updated successfully';
    return res.redirect('back');
  } catch (err) {
    // console.log(err);
    await conn.rollback();
    req.session.redirector = 'group';
    req.session.err = ['Error happened while saving the group'];
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
});

module.exports = router;
