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
    const locals = await pool.query(
      'select id, language, abbreviation, direction from locals'
    );

    const groups = await pool.query(
      'select id, name from groups order by name '
    );

    return res.render('attributes/index', {
      title: 'Attributes',
      button: 'Create attribute',
      buttonClass: 'create-attribute',
      locals,
      groups
    });
  } catch (err) {
    return res.render('error'); // error page
  }
});

async function validateAttribute(body) {
  const errs = [];
  const {
    attr_type,
    attr_name,
    attr_description,
    attr_required,
    attr_default_area,
    attr_default,
    attr_minimum,
    attr_maximum,
    attr_unit,
    attr_options,
    attr_labels,
    attr_groups
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
  // if (!alphaNumericDasheSpace.test(attr_name))
  // errs.push('Name only accepts characters, numbers, space, dash and underscore'});

  ////////// Attribute Type //////////////
  if (typeof attr_type === 'undefined' || !types.includes(attr_type))
    errs.push('Attribute type field is invalid');

  ////////// Attribute Name //////////////
  if (typeof attr_name === 'undefined' || attr_name === '')
    errs.push('Name field is required');

  if (attr_name.length < 2) errs.push('Name field minimum length is 2 letters');

  if (attr_name.length > 250)
    errs.push('Name field maximum length is 250 letters');

  ////////// Attribute Description //////////////
  if (attr_description !== '' && attr_description.length < 2)
    errs.push('Description field minimum length is 2 letters');

  if (attr_description !== '' && attr_description.length > 250)
    errs.push('Description field maximum length is 250 letters');

  ////////// Attribute Default //////////////
  if (attr_default !== '' && attr_default.length < 2)
    errs.push('Default field minimum length is 2 letters');

  if (attr_default !== '' && attr_default.length > 250)
    errs.push('Default field maximum length is 250 letters');

  ///////// Attribute Min -- Attribute Max ////
  if (attr_type == 'text' || attr_type == 'textarea' || attr_type == 'number') {
    if (attr_minimum !== '' && isNaN(attr_minimum))
      errs.push('Minimum field must be numeric');

    if (attr_minimum !== '' && attr_minimum < 1)
      errs.push('Minimum field value is 1');

    if (attr_minimum !== '' && attr_minimum > 10000)
      errs.push('Minimum field maximum value is 10000');

    if (attr_maximum !== '' && isNaN(attr_maximum))
      errs.push('Maximum field must be numeric');

    if (attr_maximum !== '' && attr_maximum < 1)
      errs.push('Maximum field minimum value is 1');

    if (attr_maximum !== '' && attr_maximum > 10000)
      errs.push('Maximum field maximum value is 10000');
  }

  ////////// Attribute Unit //////////////
  if (attr_unit !== '' && attr_unit.length < 2)
    errs.push('Unit field minimum length is 2 letters');

  if (attr_unit !== '' && attr_unit.length > 250)
    errs.push('Unit field maximum length is 250 letters');

  ////////// Attribute english label //////////////
  const posted_attr_label_ids = [];
  if (typeof attr_labels === 'undefined') {
    errs.push('Label is required.');
  } else {
    for (let id in attr_labels) {
      if (Object.hasOwnProperty.call(attr_labels, id)) {
        number_id = parseInt(id.replace('"', '')); // remove "" around the number
        if (number_id === 1 && attr_labels[id] == '')
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
        if (!isNaN(number_id)) posted_attr_label_ids.push(number_id);
        else errs.push('Label is invalid');
      }
    }
  }
  if (!posted_attr_label_ids.includes(1))
    errs.push('English label is required'); // id 1 is the english label

  ////////// Attribute english label //////////////
  if (typeof attr_required !== 'undefined' && attr_required !== 'true')
    errs.push('Required field is invalid');

  ////////// Attribute Default //////////////
  if (attr_default_area !== '' && attr_default_area.length < 10)
    errs.push('Default textarea field minimum length is 10 letters');

  if (attr_default_area !== '' && attr_default_area.length > 10000)
    errs.push('Default textarea field maximum length is 10000 letters');

  ////////// Attribute Options //////////////
  if (attr_options !== '' && attr_options.length < 2)
    errs.push('Options field minimum length is 2 letters');

  if (attr_options !== '' && attr_options.length > 10000)
    errs.push('Options field maximum length is 10000 letters');

  ////////// Attribute email //////////////
  if (attr_type === 'email' && attr_default !== '' && !isEmail(attr_default))
    errs.push('Email default value is invalid email');

  ////////// Attribute groups //////////////
  try {
    const groups = await pool.query('select id from groups');
    const groups_ids = groups.map((group) => group.id);
    // check group ids are exist in groups in table
    if (typeof attr_groups !== 'undefined') {
      attr_groups.forEach((attr_group) => {
        if (
          !groups_ids.includes(parseInt(attr_group)) ||
          isNaN(parseInt(attr_group))
        )
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
    attr_type,
    attr_name,
    attr_description,
    attr_required,
    attr_default_area,
    attr_default,
    attr_minimum,
    attr_maximum,
    attr_unit,
    attr_options,
    attr_groups,
    attr_labels
  } = body;

  const attr_slug = attr_name + '-' + new Date().getTime();
  attr_required = attr_required == 'true';
  attr_minimum = parseInt(attr_minimum) || null;
  attr_maximum = parseInt(attr_maximum) || null;

  try {
    const attr_query = `insert into attributes ( 
      type, name ,slug, description, required, default_value, min, max, unit, attr_default_area
    ) values(?,?,?,?,?,?,?,?,?,?)`;

    const attr_values = [
      attr_type,
      attr_name,
      attr_slug,
      attr_description,
      attr_required,
      attr_default,
      attr_minimum,
      attr_maximum,
      attr_unit,
      attr_default_area
    ];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const res = await conn.query(attr_query, attr_values);
    const attr_id = res.insertId;

    // options
    if (typeof attr_options !== 'undefined' && attr_options.length >= 2) {
      let splitted_options = attr_options.split('\r\n');
      splitted_options = splitted_options.filter(
        (option) => option.trim() != '' || option == '\r'
      );
      const attr_options_query = `insert into attribute_options (name, attribute_id) values(?,?)`;
      const options_values = [];
      splitted_options.forEach((option) => {
        options_values.push([option, attr_id]);
      });
      await conn.batch(attr_options_query, options_values);
    }

    // Locals - labels;
    const attr_labels_query = `insert into attribute_labels (local_id, label, attribute_id) values(?,?,?)`;

    const posted_attr_labels = [];
    for (let id in attr_labels) {
      if (Object.hasOwnProperty.call(attr_labels, id)) {
        v = attr_labels[id];
        number_id = parseInt(id.replace('"', '')); // remove "" around the number
        if (typeof v !== 'undefined' && v.length > 1) {
          posted_attr_labels.push([number_id, v, attr_id]);
        }
      }
    }
    await conn.batch(attr_labels_query, posted_attr_labels);

    //groups
    if (typeof attr_groups !== 'undefined') {
      // may not choose groups
      const groups_query = `insert into attribute_groups (group_id, attribute_id) values(?,?)`;
      const groups_values = [];
      attr_groups.forEach((group_id) => {
        groups_values.push([group_id, attr_id]);
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
