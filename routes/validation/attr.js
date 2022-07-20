const { isEmail, isNumeric } = require('validator');
const pool = require('../../config/db_pool');

async function validateAttribute(body) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;

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
    groups,
    id
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

  // Edit Attribue
  if (typeof id !== undefined && isNumeric(id)) {
    // edit attribute
    try {
      const q = `select * from attributes where id = ?`;
      const results = await pool.query(q, [id]);
      let attr;
      if (typeof results !== 'undefined') {
        attr = results[0];
      }
      switch (attr.type) {
        case 'text':
        case 'number':
        case 'email':
        case 'textarea':
        case 'switch':
        case 'images':
          if (attr.type !== type) errs.push('Attribute type field is invalid');
          break;

        case 'check-boxes':
        case 'radio-buttons':
        case 'single-select':
        case 'multiple-select':
          if (
            attr.type !== 'check-boxes' &&
            attr.type !== 'radio-buttons' &&
            attr.type !== 'single-select' &&
            attr.type !== 'multiple-select'
          )
            errs.push('Attribute type field is invalid');
          break;
        case 'date':
        case 'datetime':
          if (attr.type !== 'date' && attr.type !== 'datetime')
            errs.push('Attribute type field is invalid');
          break;
      }
    } catch (err) {
      errs.push('Attribute id is invalid');
    }
  }

  /// save create attr
  if (typeof type === 'undefined' || !types.includes(type))
    ////////// Attribute Type //////////////
    errs.push('Attribute type field is invalid');

  ////////// Attribute Name //////////////
  if (typeof name !== 'undefined') {
    if (name.length < 2) errs.push('Name field minimum length is 2 letters');
    if (name.length > 250)
      errs.push('Name field maximum length is 250 letters');
    if (name.search(alphaDashNumeric) === -1)
      errs.push(
        'Name field must contains only letters, numbers, space, dash or underscore'
      );
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
    if (type === 'number') {
      if (default_value !== '' && default_value.length < 1)
        errs.push('Default value field minimum value is 1');
      if (default_value !== '' && default_value.length > 10000000000)
        errs.push('Default value field maximum value is 10000000000');
    } else {
      if (default_value !== '' && default_value.length < 2)
        errs.push('Default value field minimum length is 2 letters');
      if (default_value !== '' && default_value.length > 250)
        errs.push('Default value field maximum length is 250 letters');
    }
  }

  ///////// Attribute Min -- Attribute Max ////
  if (typeof type !== 'undefined') {
    if (type == 'text' || type == 'textarea' || type == 'number') {
      if (typeof minimum !== 'undefined' && minimum !== '') {
        if (!isNumeric(minimum)) errs.push('Minimum field must be numeric');
        // if (minimum < 1) errs.push('Minimum field value is 1');
        // if (minimum > 10000) errs.push('Minimum field maximum value is 10000');
      }
      if (typeof maximum !== 'undefined' && maximum !== '') {
        if (!isNumeric(maximum)) errs.push('Maximum field must be numeric');
        if (parseInt(maximum) < parseInt(minimum))
          errs.push('Maximum field must be greater than minimum value');
        // if (maximum > 10000) errs.push('Maximum field maximum value is 10000');
      }
    }
  }

  ////////// Attribute Unit //////////////
  if (typeof unit !== 'undefined') {
    if (unit !== '' && unit.length < 2)
      errs.push('Unit field minimum length is 2 letters');
    if (unit !== '' && unit.length > 250)
      errs.push('Unit field maximum length is 250 letters');
    if (unit.trim().lenghth > 0 && unit.search(alphaDashNumeric) === -1)
      errs.push(
        'Unit field must contains only letters, numbers, space, dash or underscore'
      );
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
          if (abbreviation === 'en-us') {
            if (labels[abbreviation].trim().length < 1)
              errs.push('English label is required ');

            if (
              labels[abbreviation].trim().length &&
              labels[abbreviation].search(alphaDashNumeric) === -1
            )
              errs.push(
                'English label must contains only letters, numbers, space, dash or underscore'
              );
          }

          const locals = await pool.query('select abbreviation from locals');
          const locals_abbrs = locals.map((local) => local.abbreviation); // coloct locals abbrs
          // check group ids are exist in locals  table
          if (!locals_abbrs.includes(abbreviation)) errs.push('Invalid label');
        } catch (err) {
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

module.exports = validateAttribute;
