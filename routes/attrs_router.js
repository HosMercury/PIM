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

    return res.render('attributes/index', {
      title: 'Attributes',
      button: 'Create attribute',
      buttonClass: 'create-attribute',
      locals
    });
  } catch (err) {
    return res.render('error');
  }
});

function validateAttributeRequest(body) {
  const errs = [];
  console.log(body);
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
    attr_labels
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
  if (attr_options !== '' && attr_options.length < 10)
    errs.push({
      options: 'Options firld minimum length is 10'
    });

  if (attr_options !== '' && attr_options.length > 10000)
    errs.push({ options: 'Options field maximum length is 10000' });

  ////////// Attribute email //////////////
  console.log(attr_default !== '');
  if (attr_type === 'email' && attr_default !== '' && !isEmail(attr_default))
    errs.push({ label: 'The default email value is invalid' });

  return errs;
}

router.post('/attributes', async (req, res) => {
  const errs = validateAttributeRequest(req.body);
  const attributes = [];

  res.json(errs);
});

module.exports = router;
