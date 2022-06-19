const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isEmail } = require('validator');

let conn;

router.get('/', (req, res) => {
  return res.render('index', {
    title: 'Dashboard'
  });
});

router.get('/api/attributes', async (req, res) => {
  try {
    const results = await pool.query(
      `
        select id, type, name, slug, created_at
        from attributes 
        where created_at > DATE_SUB(now(), INTERVAL 6 MONTH) 
        order by id desc
      `
    );
    delete results.meta;
    return res.json(results);
  } catch (err) {
    // console.log(err);
    return res.status(400).send('error'); // error page
  }
});

router.get('/api/attributes/:id', async (req, res) => {
  if (isNaN(req.params.id)) return res.status(400).send('error');

  const id = parseInt(req.params.id);

  try {
    const results = await pool.query(
      `select a.id, a.type, a.name, a.slug, a.created_at, a.updated_at, ag.id from attributes as a join attribute_groups as ag on ag.attribute_id=a.id where a.id=?`,
      [id]
    );
    res.json(results);
  } catch (err) {
    console.log(err);
    return res.status(400).send('error'); // error page
  }
});

// Get -- Attributes home
router.get('/attributes', async (req, res) => {
  try {
    const labels = await pool.query(
      'select id, language, abbreviation, direction from locals'
    );

    const groups = await pool.query(
      'select id, name from groups order by name'
    );

    return res.render('attributes/attr_index', {
      title: 'Attributes',
      button: 'Create Attribute',
      buttonClass: 'create-attribute',
      labels,
      groups
    });
  } catch (err) {
    return res.status(400).render('error'); // error page
  }
});

async function validateAttribute(body) {
  const errs = [];
  const {
    type,
    name,
    description,
    required,
    default_area,
    default_value,
    minimum,
    maximum,
    unit,
    choices,
    labels,
    groups
  } = body;

  const types = [
    'text',
    'number',
    'date',
    'datetime',
    'email',
    'textarea',
    'switch',
    'images',
    'check-boxes',
    'radio-buttons',
    'single-select',
    'multiple-select'
  ];

  ////////// Attribute Type //////////////
  if (typeof type === 'undefined' || !types.includes(type))
    errs.push('Attribute type field is invalid');

  ////////// Attribute Name //////////////
  if (typeof name !== 'undefined') {
    if (name.length < 2) errs.push('Name field minimum length is 2 letters');
    if (name.length > 250)
      errs.push('Name field maximum length is 250 letters');
  } else errs.push('Name field is required');

  ////////// Attribute Description //////////////
  if (typeof description !== 'undefined') {
    if (description !== '' && description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description !== '' && description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }

  ////////// Attribute Default //////////////
  if (typeof default_value !== 'undefined') {
    if (default_value !== '' && default_value.length < 2)
      errs.push('Default value field minimum length is 2 letters');
    if (default_value !== '' && default_value.length > 250)
      errs.push('Default value field maximum length is 250 letters');
  }

  ///////// Attribute Min -- Attribute Max ////
  if (typeof type !== 'undefined') {
    if (type == 'text' || type == 'textarea' || type == 'number') {
      if (typeof minimum !== 'undefined') {
        if (isNaN(minimum)) errs.push('Minimum field must be numeric');
        if (minimum < 1) errs.push('Minimum field value is 1');
        if (minimum > 10000) errs.push('Minimum field maximum value is 10000');
      }
      if (typeof maximum !== 'undefined') {
        if (isNaN(maximum)) errs.push('Maximum field must be numeric');
        if (parseInt(maximum) < parseInt(minimum))
          errs.push('Maximum field must be greater than minimum value');
        if (maximum > 10000) errs.push('Maximum field maximum value is 10000');
      }
    }
  }

  ////////// Attribute Unit //////////////
  if (typeof unit !== 'undefined') {
    if (unit !== '' && unit.length < 2)
      errs.push('Unit field minimum length is 2 letters');
    if (unit !== '' && unit.length > 250)
      errs.push('Unit field maximum length is 250 letters');
  }

  ////////// Attribute english label //////////////
  if (typeof labels !== 'undefined') {
    if (
      labels &&
      Object.keys(labels).length > 0 &&
      Object.getPrototypeOf(labels) === Object.prototype
    ) {
      // check labels that are not empty
      let values = Object.values(labels);
      values = values.filter((label) => label.trim().length > 0);

      if (values.length < 1) errs.push('English label is required ');

      const posted_labels = [];
      for (let abbreviation in labels) {
        try {
          if (
            abbreviation === 'en-us' &&
            labels[abbreviation].trim().length < 1
          )
            errs.push('English label is required ');

          const locals = await pool.query('select abbreviation from locals');
          const locals_abbrs = locals.map((local) => local.abbreviation); // coloct locals abbrs
          // check group ids are exist in locals  table
          if (!locals_abbrs.includes(abbreviation)) errs.push('Invalid label');
        } catch (err) {
          // console.log('db err',err);
          errs.push('DB error getting labels');
        }
      }
    }
  } else errs.push('English label is required');

  ////////// Attribute required checkbox label //////////////
  if (typeof required !== 'undefined')
    if (required !== 'true') errs.push('Required field is invalid');

  ////////// Attribute Default //////////////
  if (typeof default_area !== 'undefined') {
    if (default_area !== '' && default_area.length < 10)
      errs.push('Default textarea field minimum length is 10 letters');
    if (default_area !== '' && default_area.length > 10000)
      errs.push('Default textarea field maximum length is 10000 letters');
  }

  ////////// Attribute choices //////////////
  if (typeof type !== 'undefined') {
    if (typeof choices !== 'undefined') {
      if (
        type == 'single-select' ||
        type == 'multiple-select' ||
        type == 'radio-buttons' ||
        type == 'check-boxes'
      ) {
        if (choices.length < 1) {
          errs.push('At least one choice is required');
        }
      } else {
        choices.forEach((choice) => {
          if (choice.trim().length < 2)
            errs.push('Choice minimum length is 2 letters');
        });
      }
    }
  }

  ////////// Attribute email //////////////
  if (typeof type !== 'undefined')
    if (typeof email !== 'undefined')
      if (type === 'email' && !isEmail(default_value))
        errs.push('Email default value is invalid email');

  ////////// Attribute groups //////////////
  try {
    if (typeof groups !== 'undefined') {
      // check group ids are exist in groups in table
      const groups = await pool.query('select id from groups');
      const groups_ids = groups.map((group) => group.id);
      groups.forEach((group) => {
        if (!groups_ids.includes(parseInt(group.id)))
          errs.push('Invalid group id');
      });
    }
  } catch (err) {
    // console.log(err);
    errs.push('DB error getting groups ids');
  }

  /////////// Finally return the errs ///////
  return errs;
}

// post a new attribute
async function postAttribute(body) {
  let {
    type,
    name,
    description,
    required,
    default_area,
    default_value,
    minimum,
    maximum,
    unit,
    choices,
    groups,
    labels
  } = body;

  const slug = name.replace(/[^0-9a-z]/gi, '') + '-' + new Date().getTime();
  required = required == 'true';
  minimum = parseInt(minimum) || null;
  maximum = parseInt(maximum) || null;

  try {
    const query = `insert into attributes ( 
      type, name ,slug, description, required, default_value, min, max, unit, default_area
    ) values(?,?,?,?,?,?,?,?,?,?)`;

    const values = [
      type,
      name,
      slug,
      description,
      required,
      default_value,
      minimum,
      maximum,
      unit,
      default_area
    ];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const res = await conn.query(query, values);
    const attr_id = res.insertId;

    // Choices ---
    if (typeof choices !== 'undefined' && choices.length > 0) {
      const options_query = `insert into attribute_choices (name, attribute_id) values(?,${attr_id})`;
      await conn.batch(options_query, choices);
    }

    // Locals - labels;
    const labels_query = `insert into attribute_labels (local_id, label, attribute_id) values(?,?,${attr_id})`;
    const lbels_array = [];
    for (let abbreviation in labels) {
      const results = await pool.query(
        'select id from locals where abbreviation = ?',
        [abbreviation]
      );
      const label_id = results[0].id;
      if (labels[abbreviation].trim().length > 0) {
        lbels_array.push([label_id, labels[abbreviation]]);
      }
    }
    await conn.batch(labels_query, lbels_array);

    //groups
    if (typeof groups !== 'undefined' && groups.length > 0) {
      // remove empty groups items
      groups = groups.filter((group) => group.trim().length > 0);
      groups = groups.map((group) => parseInt(group));
      const groups_query = `insert into attribute_groups (group_id, attribute_id) values(?,${attr_id})`;
      await conn.batch(groups_query, groups);
    }

    await conn.commit();
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/attributes', async (req, res) => {
  // console.log(req.body);
  // return res.json(req.body);
  const errs = await validateAttribute(req.body);
  if (errs.length > 0) {
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }
  postAttribute(req.body);
  req.session.msg = 'Attribute added successfully';
  return res.status(200).redirect('back');
});

module.exports = router;
