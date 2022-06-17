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

// Get -- Attributes home
router.get('/attributes', async (req, res) => {
  try {
    const labels = await pool.query(
      'select id, language, abbreviation, direction from locals'
    );

    const groups = await pool.query(
      'select id, name from groups order by name'
    );

    return res.render('attributes/index', {
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
    if (description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }

  ////////// Attribute Default //////////////
  if (typeof default_value !== 'undefined') {
    if (default_value.length < 2)
      errs.push('Default value field minimum length is 2 letters');
    if (default_value.length > 250)
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
        if (maximum < 1) errs.push('Maximum field minimum value is 1');
        if (maximum > 10000) errs.push('Maximum field maximum value is 10000');
      }
    }
  }

  ////////// Attribute Unit //////////////
  if (typeof unit !== 'undefined') {
    if (unit.length < 2) errs.push('Unit field minimum length is 2 letters');
    if (unit.length > 250)
      errs.push('Unit field maximum length is 250 letters');
  }

  ////////// Attribute english label //////////////
  if (typeof labels !== 'undefined') {
    if (labels.length > 0) {
      const posted_labels = [];
      for (let abbreviation in labels) {
        try {
          const locals = await pool.query('select abbreviation from locals');
          const locals_abbrs = locals.map((local) => local.abbreviation); // coloct locals abbrs
          // check group ids are exist in locals  table
          if (!locals_abbrs.includes(abbreviation)) errs.push('Invalid label');
        } catch (err) {
          // console.log('db err',err);
          errs.push('DB error getting labels');
        }
      }
    } else errs.push('At least one label is required');
  } else errs.push('At least english label is required');

  ////////// Attribute required checkbox label //////////////
  if (typeof required !== 'undefined')
    if (required !== 'true') errs.push('Required field is invalid');

  ////////// Attribute Default //////////////
  if (typeof default_area !== 'undefined') {
    if (default_area.length < 10)
      errs.push('Default textarea field minimum length is 10 letters');
    if (default_area.length > 10000)
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

  const slug = name.replace(' ', '-') + '-' + new Date().getTime();
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
    const id = res.insertId;

    // options
    if (typeof options !== 'undefined' && options.length >= 2) {
      let splitted_options = options.split('\r\n');
      splitted_options = splitted_options.filter(
        (option) => option.trim() != '' || option == '\r'
      );
      const options_query = `insert into attribute_options (name, attribute_id) values(?,?)`;
      const options_values = [];
      splitted_options.forEach((option) => {
        options_values.push([option, id]);
      });
      await conn.batch(options_query, options_values);
    }

    // Locals - labels;
    const labels_query = `insert into attribute_labels (local_id, label, attribute_id) values(?,?,?)`;

    const posted_labels = [];
    for (let abbreviation in labels) {
      if (
        typeof abbreviation !== 'undefined' &&
        labels[abbreviation].length > 1
      ) {
        const result = await pool.query(
          'select id from locals where abbreviation = (?) limit 1',
          [abbreviation]
        );
        const _id = result[0].id;
        posted_labels.push([_id, labels[abbreviation], id]);
      }
    }
    await conn.batch(labels_query, posted_labels);

    //groups
    if (typeof groups !== 'undefined') {
      // may not choose groups
      const groups_query = `insert into attribute_groups (group_id, attribute_id) values(?,?)`;
      const groups_values = [];
      groups.forEach((group_id) => {
        groups_values.push([group_id, id]);
      });

      await conn.batch(groups_query, groups_values);
    }

    await conn.commit();
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/attributes', async (req, res) => {
  // return res.json(req.body);
  const errs = await validateAttribute(req.body);
  if (errs.length > 0) {
    req.session.errs = errs;
    req.session.old = req.body;
    return res.redirect('back');
  }
  postAttribute(req.body);
  req.session.msg = 'Attribute added successfully';
  return res.redirect('back');
});

module.exports = router;
