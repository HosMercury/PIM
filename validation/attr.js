const { isEmail, isNumeric } = require('validator');
const pool = require('../config/db_pool');

async function validateAttribute(body, id = null) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const errs = [];
  let {
    type,
    name,
    description,
    required,
    defaultValue,
    min,
    max,
    unit,
    choices,
    locals,
    groups
  } = body;

  const types = [
    'Text',
    'Number',
    'Date',
    'Date Time',
    'Email',
    'Text Area',
    'Switch',
    'Images',
    'Check Boxes',
    'Radio Buttons',
    'Single Select',
    'Multiple Select'
  ];
  //////////////////// Type validation /////////////////
  if (id) {
    try {
      const results = await pool.query(
        'select type from attributes where id = ?',
        [id]
      );

      const attr_type = results[0].type;

      switch (attr_type) {
        case 'Text':
        case 'Number':
        case 'Email':
        case 'Text Area':
        case 'Switch':
        case 'Images':
          if (attr_type !== type) errs.push('Attribute type field is invalid');
          break;

        case 'Check Boxes':
        case 'Radio Buttons':
        case 'Single Select':
        case 'Multiple Select':
          if (
            attr_type !== 'Check Boxes' &&
            attr_type !== 'Radio Buttons' &&
            attr_type !== 'Single Select' &&
            attr_type !== 'Multiple Select'
          )
            errs.push('Attribute type field is invalid');
          break;
        case 'date':
        case 'datetime':
          if (attr_type !== 'Date' && attr_type !== 'Date Time')
            errs.push('Attribute type field is invalid');
          break;
      }
    } catch (err) {
      // console.log(err);
      generateValGeneralErrorResponse(res);
    }
  }

  if (type !== 'undefined' && !types.includes(type))
    errs.push('Attribute type field is invalid');

  ////////// Attribute Name //////////////
  if (typeof name !== 'undefined') {
    name = name.trim();
    if (name.length < 2) errs.push('Name field min length is 2 letters');
    if (name.length > 250) errs.push('Name field max length is 250 letters');
    if (name.search(alphaDashNumeric) === -1)
      errs.push(
        'Name field must contains only letters, numbers, space, dash and underscore'
      );
  } else errs.push('Name field is required');

  ////////// Attribute Description //////////////
  if (typeof description !== 'undefined') {
    description = description.trim();
    if (description !== '' && description.length < 2)
      errs.push('Description field min length is 2 letters');
    if (description !== '' && description.length > 250)
      errs.push('Description field max length is 250 letters');
  }

  ////////// Attribute Default //////////////
  if (typeof defaultValue !== 'undefined') {
    defaultValue = defaultValue.trim();
    if (type === 'Number') {
      if (defaultValue !== '' && defaultValue.length < 1)
        errs.push('Default value field min value is 1');
      if (defaultValue !== '' && defaultValue.length > 10000000000)
        errs.push('Default value field max value is 10000000000');
    } else {
      if (defaultValue !== '' && defaultValue.length < 2)
        errs.push('Default value field min length is 2 letters');
      if (defaultValue !== '' && defaultValue.length > 250)
        errs.push('Default value field max length is 250 letters');
    }
  }

  ///////// Attribute Min -- Attribute Max ////
  if (typeof type !== 'undefined') {
    type = type.trim();
    if (type == 'Text' || type == 'Text Area' || type == 'Number') {
      if (typeof min !== 'undefined' && min !== '') {
        if (!isNumeric(min.toString())) errs.push('min field must be numeric');
      }
      if (typeof max !== 'undefined' && max !== '') {
        if (!isNumeric(max.toString())) errs.push('max field must be numeric');
        if (parseInt(max) < parseInt(min))
          errs.push('Max field must be greater than min value');
      }
    }
  }

  ////////// Attribute Unit //////////////
  if (typeof unit !== 'undefined') {
    unit = unit.trim();
    if (unit !== '' && unit.length < 2)
      errs.push('Unit field min length is 2 letters');
    if (unit !== '' && unit.length > 50)
      errs.push('Unit field max length is 250 letters');
    if (unit.trim().lenghth > 0 && unit.search(alphaDashNumeric) === -1)
      errs.push(
        'Unit field must contains only letters, numbers, space, dash and underscore'
      );
  }

  ////////// Attribute required checkbox  //////////////
  if (typeof required !== 'undefined') {
    if (typeof required !== 'boolean') errs.push('Required field is invalid');
  }

  ////////// Attribute email //////////////
  if (typeof type !== 'undefined' && typeof email !== 'undefined') {
    email = email.trim();
    if (type === 'Email' && !isEmail(defaultValue))
      errs.push('Email default value is invalid email');
  }

  ////////// Attribute english local //////////////
  if (typeof locals !== 'undefined' && locals.length > 0) {
    const locals_ids = locals.map((local) => local.id);

    if (!locals_ids.includes(1)) {
      errs.push('English local is required');
    }

    locals.forEach(async (local) => {
      for (const k in locals) {
        const lc = locals[k].local.trim();
        const id = locals[k].id;

        if (lc.length < 2) {
          errs.push('Local min length is 2 letters');
        }

        if (!isNumeric(id.toString())) {
          errs.push('Invalid Local id');
        }
      }
    });
  } else {
    errs.push('English local is required');
  }

  ////////// Attribute choices //////////////
  if (typeof type !== 'undefined' && typeof choices !== 'undefined') {
    if (
      type == 'Single Select' ||
      type == 'Multiple Select' ||
      type == 'Radio Buttons' ||
      type == 'Check Boxes'
    ) {
      if (choices.length < 1) {
        errs.push('At least one choice is required');
      }
    } else {
      choices.forEach((choice) => {
        if (choice.trim().length < 2)
          errs.push('Choice min length is 2 letters');
      });
    }
  }

  ////////// Attribute groups //////////////
  if (typeof groups !== 'undefined') {
    // check group ids are exist in groups in table
    // const groups_ids = await pool.query(
    //   'select  json_arrayagg(id) from groups'
    // );
    groups.forEach((id) => {
      // if (!groups_ids.includes(parseInt(group.id)))
      //   errs.push('Invalid group id');
      if (!isNumeric(id.toString())) {
        errs.push('Invalid group id');
      }
    });
  }

  /////////// Finally return the errs ///////
  return errs;
}

module.exports = validateAttribute;
