const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isEmail } = require('validator');

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
      'select id, name from groups order by name '
    );

    return res.render('attributes/index', {
      title: 'Attributes',
      button: 'Create attribute',
      buttonClass: 'create-attribute',
      labels,
      groups
    });
  } catch (err) {
    return res.render('error'); // error page
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
    options,
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

  // const alphaNumericDasheSpace = new RegExp(/^[0-9A-Za-z\s\-\_]+$/);
  // const alphaNumericDash = new RegExp(/^[0-9A-Za-z\-\_]+$/);
  // if (!alphaNumericDasheSpace.test(name))
  // errs.push('Name only accepts characters, numbers, space, dash and underscore'});

  ////////// Attribute Type //////////////
  if (typeof type === 'undefined' || !types.includes(type))
    errs.push('Attribute type field is invalid');

  console.log('atttt typpppe', type);

  ////////// Attribute Name //////////////
  if (typeof name === 'undefined' || name === '')
    errs.push('Name field is required');

  if (name.length < 2) errs.push('Name field minimum length is 2 letters');

  if (name.length > 250) errs.push('Name field maximum length is 250 letters');

  ////////// Attribute Description //////////////
  if (description !== '' && description.length < 2)
    errs.push('Description field minimum length is 2 letters');

  if (description !== '' && description.length > 250)
    errs.push('Description field maximum length is 250 letters');

  ////////// Attribute Default //////////////
  if (default_value !== '' && default_value.length < 2)
    errs.push('Default field minimum length is 2 letters');

  if (default_value !== '' && default_value.length > 250)
    errs.push('Default field maximum length is 250 letters');

  ///////// Attribute Min -- Attribute Max ////
  if (type == 'text' || type == 'textarea' || type == 'number') {
    if (minimum !== '' && isNaN(minimum))
      errs.push('Minimum field must be numeric');

    if (minimum !== '' && minimum < 1) errs.push('Minimum field value is 1');

    if (minimum !== '' && minimum > 10000)
      errs.push('Minimum field maximum value is 10000');

    if (maximum !== '' && isNaN(maximum))
      errs.push('Maximum field must be numeric');

    if (maximum !== '' && maximum < 1)
      errs.push('Maximum field minimum value is 1');

    if (maximum !== '' && maximum > 10000)
      errs.push('Maximum field maximum value is 10000');
  }

  ////////// Attribute Unit //////////////
  if (unit !== '' && unit.length < 2)
    errs.push('Unit field minimum length is 2 letters');

  if (unit !== '' && unit.length > 250)
    errs.push('Unit field maximum length is 250 letters');

  ////////// Attribute english label //////////////
  const posted_label_ids = [];
  if (typeof labels === 'undefined') {
    errs.push('Label is required.');
  } else {
    for (let id in labels) {
      if (Object.hasOwnProperty.call(labels, id)) {
        number_id = parseInt(id.replace('"', '')); // remove "" around the number
        if (number_id === 1 && labels[id] == '')
          errs.push('English label is required');
        try {
          const locals = await pool.query('select id from locals');
          const locals_ids = locals.map((local) => parseInt(local.id)); // coloct loclas ids
          // check group ids are exist in locals  table
          if (!locals_ids.includes(number_id)) errs.push('Invalid label id');
        } catch (err) {
          // console.log('db err',err);
          errs.push('DB error getting labels');
        }
        // validate id
        if (!isNaN(number_id)) posted_label_ids.push(number_id);
        else errs.push('Label is invalid');
      }
    }
  }
  if (!posted_label_ids.includes(1)) errs.push('English label is required'); // id 1 is the english label

  ////////// Attribute english label //////////////
  if (typeof required !== 'undefined' && required !== 'true')
    errs.push('Required field is invalid');

  ////////// Attribute Default //////////////
  if (default_area !== '' && default_area.length < 10)
    errs.push('Default textarea field minimum length is 10 letters');

  if (default_area !== '' && default_area.length > 10000)
    errs.push('Default textarea field maximum length is 10000 letters');

  ////////// Attribute Options //////////////
  if (options !== '' && options.length < 2)
    errs.push('Options field minimum length is 2 letters');

  if (options !== '' && options.length > 10000)
    errs.push('Options field maximum length is 10000 letters');

  ////////// Attribute email //////////////
  if (type === 'email' && default_value !== '' && !isEmail(default_value))
    errs.push('Email default value is invalid email');

  ////////// Attribute groups //////////////
  try {
    const groups = await pool.query('select id from groups');
    const groups_ids = groups.map((group) => group.id);
    // check group ids are exist in groups in table
    if (typeof groups !== 'undefined') {
      groups.forEach((group) => {
        if (!groups_ids.includes(parseInt(group)) || isNaN(parseInt(group)))
          errs.push('Invalid group id');
      });
    }
  } catch (err) {
    // console.log(err);
    errs.push('DB error getting groups ids');
  }
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
    options,
    groups,
    labels
  } = body;

  const slug = name + '-' + new Date().getTime();
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

    const conn = await pool.getConnection();
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
    for (let id in labels) {
      if (Object.hasOwnProperty.call(labels, id)) {
        v = labels[id];
        number_id = parseInt(id.replace('"', '')); // remove "" around the number
        if (typeof v !== 'undefined' && v.length > 1) {
          posted_labels.push([number_id, v, id]);
        }
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
