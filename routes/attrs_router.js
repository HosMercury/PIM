const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isEmail } = require('validator');

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
    return res.render('error');
  }
});

async function validateAttributeRequest(body) {
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

  ////////// Attribute Type //////////////
  if (
    typeof attr_type === 'undefined' ||
    !attr_type ||
    attr_type === '' ||
    !types.includes(attr_type)
  )
    errs.push({ type: 'Type field is invalid' });

  ////////// Attribute Name //////////////
  if (typeof attr_name === 'undefined' || !attr_name || attr_name === '')
    errs.push({ name: 'Name field is required' });

  if (attr_name.length < 2)
    errs.push({ name: 'Name field minimum length is 2' });

  if (attr_name.length > 250)
    errs.push({ name: 'Name field maximum length is 250' });

  ////////// Attribute Description //////////////
  if (attr_description !== '' && attr_description.length < 2)
    errs.push({ description: 'Description field minimum length is 2' });

  if (attr_description !== '' && attr_description.length > 250)
    errs.push({
      description: 'Description field maximum length is 250'
    });

  ////////// Attribute Default //////////////
  if (attr_default !== '' && attr_default.length < 2)
    errs.push({ default: 'Default field minimum length is 2' });

  if (attr_default !== '' && attr_name.length > 250)
    errs.push({ default: 'Default field maximum length is 250' });

  ////////// Attribute Min //////////////
  if (
    attr_type === 'text' ||
    attr_type === 'textarea' ||
    attr_type === 'number'
  ) {
    if (attr_minimum !== '' && isNaN(attr_minimum))
      errs.push({
        minimum: 'Minimum field must be numeric'
      });

    if (attr_minimum !== '' && attr_minimum < 1)
      errs.push({ minimum: 'Minimum field value is 1' });

    if (attr_minimum !== '' && attr_minimum > 10000)
      errs.push({
        minimum: 'Minimum field maximum value is 10000'
      });
  }

  ////////// Attribute Max //////////////
  if (
    attr_type === 'text' ||
    attr_type === 'textarea' ||
    attr_type === 'number'
  ) {
    if (attr_maximum !== '' && isNaN(attr_maximum))
      errs.push({
        maximum: 'Maximum field must be numeric'
      });

    if (attr_maximum !== '' && attr_maximum < 1)
      errs.push({ maximum: 'Maximum field minimum value is 1' });

    if (attr_maximum !== '' && attr_maximum > 10000)
      errs.push({
        maximum: 'Maximum field maximum value is 10000'
      });
  }

  ////////// Attribute Unit //////////////
  if (attr_unit !== '' && attr_unit.length < 2)
    errs.push({ unit: 'Unit field minimum length is 2' });

  if (attr_unit !== '' && attr_unit.length > 250)
    errs.push({
      unit: 'Unit field maximum length is 250'
    });

  ////////// Attribute english label //////////////
  if (
    typeof attr_labels[0] === 'undefined' ||
    !attr_labels[0] ||
    attr_labels[0] === ''
  )
    errs.push({ label: 'The english label is required' });

  ////////// Attribute english label //////////////
  if (typeof attr_required !== 'undefined' && attr_required !== 'true')
    errs.push({ required: 'The required field is invalid' });

  ////////// Attribute Default //////////////
  if (attr_default_area !== '' && attr_default_area.length < 10)
    errs.push({
      defaut_textarea: 'Default textarea field minimum length is 10'
    });

  if (attr_default_area !== '' && attr_default_area.length > 10000)
    errs.push({
      defaut_textarea: 'Default textarea field maximum length is 10000'
    });

  ////////// Attribute Options //////////////
  if (attr_options !== '' && attr_options.length < 2)
    errs.push({
      options: 'Options field minimum length is 2'
    });

  if (attr_options !== '' && attr_options.length > 10000)
    errs.push({ options: 'Options field maximum length is 10000' });

  ////////// Attribute email //////////////
  if (attr_type === 'email' && attr_default !== '' && !isEmail(attr_default))
    errs.push({ label: 'The default email value is invalid' });

  ////////// Attribute groups //////////////
  try {
    const groups = await pool.query('select id from groups');
    const groups_ids = groups.map((group) => group.id);
    // check group ids are exist in groups in table
    if (typeof attr_groups !== 'undefined') {
      attr_groups.forEach((attr_group) => {
        if (!groups_ids.includes(parseInt(attr_group)))
          errs.push({ groups: 'Invalid group id' });
      });
    }
  } catch (err) {
    // console.log(err);
    errs.push({ general: 'DB error getting groups ids' });
  }
  return errs;
}

async function prepareAttributeObject(body) {
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
        (option) => option != '' || option == '\r'
      );
      const attr_options_query = `insert into attribute_options (name, attribute_id) values(?,?)`;
      const options_values = [];
      splitted_options.forEach((option) => {
        console.log('option', option);
        options_values.push(option, attr_id);
      });
      await conn.query(attr_options_query, options_values);
    }

    // labels
    const locals = await pool.query('select * from locals');
    const attr_labels_query = `insert into attribute_labels (local_id, label, attribute_id) values(?,?,?)`;
    const labels_values = [];
    for (let i = 0; i < attr_labels.length; i++) {
      labels_values.push(locals[i].id, attr_labels[i], attr_id);
    }
    await conn.query(attr_labels_query, labels_values);

    //groups
    if (typeof attr_groups !== 'undefined') {
      const groups_query = `insert into attribute_groups (group_id, attribute_id) values(?,?)`;
      const groups_values = [];
      attr_groups.forEach((group_id) => {
        groups_values.push(parseInt(group_id));
      });
      await conn.query(groups_query, groups_values);
    }

    await conn.commit();
  } catch (err) {
    console.log(err);
    await conn.rollback();
  }
}

router.post('/attributes', async (req, res) => {
  console.log('req.body', req.body);
  const errs = await validateAttributeRequest(req.body);
  const attribute = prepareAttributeObject(req.body);

  res.json(errs);
});

module.exports = router;

// why only one group sent !!!
