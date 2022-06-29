const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const { isEmail } = require('validator');
const { app } = require('tailwind');

let conn;

router.get('/', (req, res) => {
  return res.render('index', {
    title: 'Dashboard'
  });
});

// post req
async function deleteAttribute(req) {
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const id = parseInt(req.params.id);

    const attr_choices_query = `delete from attribute_choices where attribute_id = ?`;
    await conn.batch(attr_choices_query, [id]);

    const attr_gps_query = `delete from attribute_groups where attribute_id = ?`;
    await conn.batch(attr_gps_query, [id]);

    const attr_lbs_query = `delete from attribute_labels where attribute_id = ?`;
    await conn.batch(attr_lbs_query, [id]);

    const delete_attr = `delete from attributes where id = ?`;
    await conn.batch(delete_attr, [id]);

    await conn.commit();

    return true;
  } catch (err) {
    // console.log(err);
    await conn.rollback();
    return false;
  }
}

// delete attr
router.post('/attributes/:id/delete', async (req, res) => {
  if (await deleteAttribute(req)) {
    req.session.msg = 'Attribute deleted successfully';
    return res.status(200).redirect('back');
  } else {
    req.session.err = 'Error while deleting the attribute';
    return res.status(400).redirect('back');
  }
});

// Get all atrrs by json or api
router.get('/api/attributes', async (req, res) => {
  try {
    let results = await pool.query(
      `
        select a.* ,
        JSON_ARRAYAGG(JSON_OBJECT('id', g.id,'name', g.name)) as groups
        ,JSON_ARRAYAGG(JSON_OBJECT("id", al.local_id, "abbreviation",l.abbreviation,"name", al.label)) as locals
        ,JSON_ARRAYAGG(JSON_OBJECT('id', ac.id,"name", ac.name)) as choices,
        (select cast(count(*) as char) from attribute_groups ag where ag.attribute_id = a.id) groups_count,
        (select cast(count(*) as char) from attribute_labels al where al.attribute_id = a.id) labels_count,
        (select cast(count(*) as char) from attribute_choices ac where ac.attribute_id = a.id) choices_count
        FROM attributes a
        left join attribute_groups ag on a.id = ag.attribute_id
        left join groups g on g.id = ag.group_id
        left join attribute_labels al on a.id = al.attribute_id
        left join locals l on l.id = al.local_id
        left join attribute_choices ac on a.id = ac.attribute_id
        group by a.id
        order by a.id desc limit 10000
      `
    );
    return res.json(results);
  } catch (err) {
    // console.log(err);
    return res.status(400).send('error'); // error page
  }
});

// Get -- Attributes home page
router.get('/attributes', async (req, res) => {
  try {
    const labels = await pool.query(
      'select id, name, abbreviation, direction from locals'
    );

    const groups = await pool.query(
      'select id, name from groups order by name'
    );

    return res.render('attr_index', {
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
  if (typeof id !== undefined && typeof id !== 'blank' && !isNaN(id)) {
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
      if (typeof minimum !== 'undefined') {
        if (isNaN(minimum)) errs.push('Minimum field must be numeric');
        // if (minimum < 1) errs.push('Minimum field value is 1');
        // if (minimum > 10000) errs.push('Minimum field maximum value is 10000');
      }
      if (typeof maximum !== 'undefined') {
        if (isNaN(maximum)) errs.push('Maximum field must be numeric');
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

// post a new attribute or edit existing one
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
    labels,
    id
  } = body;

  const slug = name.replace(/[^0-9a-z]/gi, '') + '-' + new Date().getTime();
  required = required == 'true';
  minimum = parseInt(minimum) || null;
  maximum = parseInt(maximum) || null;

  try {
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

    const query = `insert into attributes ( 
      type, name ,slug, description, required, default_value, min, max, unit, default_area
    ) values(?,?,?,?,?,?,?,?,?,?)`;

    conn = await pool.getConnection();
    await conn.beginTransaction();

    ////////////////////////////////////////////////////////////////
    // --------------- Edit existing attribute -------------------//
    ////////////////////////////////////////////////////////////////
    if (typeof id !== undefined && typeof id !== 'blank' && !isNaN(id)) {
      const editQuery = `
        update attributes set 
          type = ? ,
          name = ? ,
          slug = ? ,
          description = ? ,
          required = ? ,
          default_value = ? ,
          min = ? ,
          max = ? ,
          unit = ? ,
          default_area = ? 
        where id = ?
      `;

      const editValues = [
        type,
        name,
        slug,
        description,
        required,
        default_value,
        minimum,
        maximum,
        unit,
        default_area,
        id
      ];

      await conn.query(editQuery, editValues);

      // Choices ---
      if (typeof choices !== 'undefined' && choices.length > 0) {
        const options_query = `delete from attribute_choices where attribute_id = ?`;
        await conn.batch(options_query, [id]);

        const _options_query = `insert into attribute_choices (name, attribute_id) values(?,${id})`;
        await conn.batch(_options_query, choices);
      }

      // labels
      // tremove labels
      const lb_query = `delete from attribute_labels where attribute_id = ?`;
      await conn.batch(lb_query, [id]);

      const labels_query = `insert into attribute_labels (local_id, label, attribute_id) values(?,?,${id})`;
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

      // groups --
      // remove old groups from
      const gp_query = `delete from attribute_groups where attribute_id = ?`;
      await conn.batch(gp_query, [id]);
      if (typeof groups !== 'undefined' && groups.length > 0) {
        // remove empty groups items
        groups = groups.filter((group) => group.trim().length > 0);
        groups = groups.map((group) => parseInt(group));
        const groups_query = `insert into attribute_groups (group_id, attribute_id) values(?,${id})`;
        await conn.batch(groups_query, groups);
      }
    } else {
      ////////////////////////////////////////////////////////////////
      // --------------- Create new attribute -------------------////
      ////////////////////////////////////////////////////////////////
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
    }

    await conn.commit();
  } catch (err) {
    // console.log(err);
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
  const success = await postAttribute(req.body);

  if (success) {
    req.session.msg = 'Attribute saved successfully';
    return res.status(200).redirect('back');
  } else {
    req.session.err = 'Error while saving the attribute';
    return res.status(400).redirect('back');
  }
});

module.exports = router;
