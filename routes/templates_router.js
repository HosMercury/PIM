const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validatetemplate = require('../validation/template');
const moment = require('moment');

let conn;

router.get('/api/templates', async (req, res) => {
  try {
    const template_attributes = await pool.query(
      `
      select t.*, 
      cast(count(tc.attribute_id) as char ) attributes_count,
      cast(count(tc.group_id) as char ) groups_count

      from templates t
      
      left join template_components tc on t.id = tc.template_id 

      group by t.id
      `
    );
    return res.json(template_attributes);
  } catch (err) {
    console.log(err);
    return res.status(400).send('error'); // error page
  }
});

// Get -- template show
router.get('/templates', async (req, res) => {
  try {
    return res.render('templates/index', {
      title: 'Templates',
      button: 'Create Template',
      buttonClass: 'create-template'
      // templates
    });
  } catch (err) {
    req.session.err = 'Error happened while fetching the templates';
    return res.status(400).redirect('back');
  }
});

// DElete -- template
router.post('/templates/:id/delete', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query(`delete from templates where id = ?`, [id]);

    req.session.msg = 'template deleted successfully';
    return res.redirect('/templates');
  } catch (err) {
    // console.log(err);
    req.session.err = 'Error happened while deleting the template';
    return res.status(400).redirect('back');
  }
});

// Get -- templates home page
router.get('/templates/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const results = await pool.query(
      `
      select g.* ,
      JSON_ARRAYAGG(JSON_OBJECT('id', a.id,'name', a.name)) as attributes,
      JSON_ARRAYAGG(JSON_OBJECT('id', g.id,'name', g.name)) as groups,
      from templates t 
      left join attribute_templates tc on t.id = tc.template_id 
      left join attributes a on a.id = tc.attribute_id 
      where t.id = ? 
    `,
      [id]
    );

    return res.json(results);
    if (results.length < 1) throw new Error('invalid template');
    const template = results[0];

    const all_attributes = await pool.query(
      `select id, name from attributes order by name asc`
    );

    template.attributes = template.attributes.filter(
      (attribute) => attribute.id
    );

    const template_attrs_ids = template.attributes.map(
      (attribute) => attribute.id
    );

    return res.render('templates/show', {
      title: 'template : ' + template.name,
      template,
      all_attributes,
      template_attrs_ids,
      moment
    });
  } catch (err) {
    // console.log(err);
    req.session.err = 'Error happened while fetching the template';
    return res.status(400).redirect('back');
  }
});

// post -- template
router.post('/templates', async (req, res) => {
  const { name, description } = req.body;
  const errs = await validatetemplate(name, description);

  // console.log(errs);

  if (errs.length > 0) {
    req.session.redirector = 'template';
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }

  /// Edit template ////
  try {
    await pool.query('insert into templates (name, description) values(?,?)', [
      name,
      description
    ]);

    req.session.msg = 'template saved successfully';
    return res.redirect('back');
  } catch (err) {
    // console.log(err);
    req.session.redirector = 'template';
    req.session.err = ['Error happened while saving the template'];
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
});

router.post('/templates/:id/edit', async (req, res) => {
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const { name, description } = req.body;
    const id = req.params.id; // template id

    const sent_attrs_ids = req.body.attributes || [];

    errs = await validatetemplate(name, description);

    if (errs.length > 0) {
      req.session.redirector = 'template';
      req.session.errs = errs;
      req.session.old = req.body;
      return res.status(400).redirect('back');
    }

    // Validate sent templates ids
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
      `update templates set name = ? ,description = ? where id = ?`,
      [name, description, id]
    );

    await conn.batch(`delete from attribute_templates where template_id = ?`, [
      id
    ]);

    if (sent_attrs_ids.length > 0) {
      const values = sent_attrs_ids.map((attribute_id) => [id, attribute_id]);
      await conn.batch(
        `insert into attribute_templates (template_id, attribute_id) values (?, ?)`,
        values
      );
    }

    await conn.commit();
    req.session.msg = 'template updated successfully';
    return res.redirect('back');
  } catch (err) {
    // console.log(err);
    await conn.rollback();
    req.session.redirector = 'template';
    req.session.err = ['Error happened while saving the template'];
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
});

module.exports = router;
