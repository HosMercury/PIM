const { isEmail, isNumeric } = require('validator');
const pool = require('../config/db_pool');

async function validateAttribute(body) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const errs = [];
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
    locals,
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

  if (type !== 'undefined' && !types.includes(type))
    errs.push('Attribute type field is invalid');

  ////////// Attribute Name //////////////
  if (typeof name !== 'undefined') {
    name = name.trim();
    if (name.length < 2) errs.push('Name field minimum length is 2 letters');
    if (name.length > 250)
      errs.push('Name field maximum length is 250 letters');
    if (name.search(alphaDashNumeric) === -1)
      errs.push(
        'Name field must contains only letters, numbers, space, dash and underscore'
      );
  } else errs.push('Name field is required');

  ////////// Attribute Description //////////////
  if (typeof description !== 'undefined') {
    description = description.trim();
    if (description !== '' && description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description !== '' && description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }

  ////////// Attribute Default //////////////
  if (typeof default_value !== 'undefined') {
    default_value = default_value.trim();
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
    type = type.trim();
    if (type == 'text' || type == 'textarea' || type == 'number') {
      if (typeof minimum !== 'undefined' && minimum.trim() !== '') {
        minimum = minimum.trim();
        if (!isNumeric(minimum.toString()))
          errs.push('Minimum field must be numeric');
      }
      if (typeof maximum !== 'undefined' && maximum.trim() !== '') {
        max = maximum.trim();
        if (!isNumeric(maximum.toString()))
          errs.push('Maximum field must be numeric');
        if (parseInt(maximum) < parseInt(minimum))
          errs.push('Maximum field must be greater than minimum value');
      }
    }
  }

  ////////// Attribute Unit //////////////
  if (typeof unit !== 'undefined') {
    unit = unit.trim();
    if (unit !== '' && unit.length < 2)
      errs.push('Unit field minimum length is 2 letters');
    if (unit !== '' && unit.length > 250)
      errs.push('Unit field maximum length is 250 letters');
    if (unit.trim().lenghth > 0 && unit.search(alphaDashNumeric) === -1)
      errs.push(
        'Unit field must contains only letters, numbers, space, dash and underscore'
      );
  }

  ////////// Attribute required checkbox label //////////////
  if (typeof required !== 'undefined') {
    if (required !== true) errs.push('Required field is invalid');
  }

  ////////// Attribute Default //////////////
  if (typeof default_area !== 'undefined') {
    default_area = default_area.trim();
    if (default_area !== '' && default_area.length < 10)
      errs.push('Default textarea field minimum length is 10 letters');
    if (default_area !== '' && default_area.length > 10000)
      errs.push('Default textarea field maximum length is 10000 letters');
  }

  ////////// Attribute email //////////////
  if (typeof type !== 'undefined' && typeof email !== 'undefined') {
    email = email.trim();
    if (type === 'email' && !isEmail(default_value))
      errs.push('Email default value is invalid email');
  }

  ////////// Attribute english label //////////////
  if (typeof locals !== 'undefined' && locals.length > 0) {
    const locals_ids = locals.map((local) => local.id);

    if (!locals_ids.includes(1)) {
      errs.push('English label is required');
    }

    locals.forEach(async (local) => {
      for (const k in locals) {
        const label = locals[k].label.trim();
        const id = locals[k].id;

        if (label.length < 2) {
          errs.push('Label minimum length is 2 letters');
        }

        if (!isNumeric(id.toString())) {
          errs.push('Invalid Local id');
        }

        // try {
        //   const db_locals_ids = await pool.query(
        //     'select json_arrayagg(id) as ids from locals group by id'
        //   );

        //   // if (!db_locals_ids.includes(id.toString())) {
        //   //   errs.push('Invalid label');
        //   // }
        // } catch (err) {
        //   errs.push('Error dfetching locals');
        // }
      }
    });
  } else {
    errs.push('English label is required');
  }

  ////////// Attribute choices //////////////
  if (typeof type !== 'undefined' && typeof choices !== 'undefined') {
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

//if (typeof id !== undefined && isNumeric(id.toString())) {
//   // edit attribute
//   try {
//     const q = `select * from attributes where id = ?`;
//     const results = await pool.query(q, [id]);
//     let attr;
//     if (typeof results !== 'undefined') {
//       attr = results[0];
//     }
//     switch (attr.type) {
//       case 'text':
//       case 'number':
//       case 'email':
//       case 'textarea':
//       case 'switch':
//       case 'images':
//         if (attr.type !== type) errs.push('Attribute type field is invalid');
//         break;

//       case 'check-boxes':
//       case 'radio-buttons':
//       case 'single-select':
//       case 'multiple-select':
//         if (
//           attr.type !== 'check-boxes' &&
//           attr.type !== 'radio-buttons' &&
//           attr.type !== 'single-select' &&
//           attr.type !== 'multiple-select'
//         )
//           errs.push('Attribute type field is invalid');
//         break;
//       case 'date':
//       case 'datetime':
//         if (attr.type !== 'date' && attr.type !== 'datetime')
//           errs.push('Attribute type field is invalid');
//         break;
//     }
//   } catch (err) {
//     errs.push('Attribute id is invalid');
//   }
// }
