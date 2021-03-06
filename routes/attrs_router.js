const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validateAttribute = require('../validation/attr');
const { isNumeric } = require('validator');
let conn;

function generateValidationErrosResponse(errs) {
  if (errs.length > 0) {
    const validationErrors = [];
    errs.forEach((err) => {
      validationErrors.push({
        type: 'validation',
        err
      });
    });
    const response = { erros: validationErrors };
    return res.status(400).json(response);
  }
}

/*
// Get all attributes
*/
router.get('/attributes', async (req, res) => {
  try {
    const attributes = await pool.query(
      `
        select a.id, a.name, a.type, a.slug, a.created_at, al.label label,
        (select cast(count(*) as char) from attribute_group ag where ag.attribute_id = a.id) groups_count,
        (select cast(count(*) as char) from attribute_local al where al.attribute_id = a.id) labels_count,
        (select cast(count(*) as char) from attribute_choice ac where ac.attribute_id = a.id) choices
        FROM attributes a
        left join attribute_group ag on a.id = ag.attribute_id
        left join groups g on g.id = ag.group_id
        left join attribute_local al on a.id = al.attribute_id
        left join locals l on l.id = al.local_id
        left join attribute_choice ac on a.id = ac.attribute_id
        group by a.id
      `
    );
    return res.json(attributes);
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the attributes'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

async function getAttributeById(id) {
  return await pool.query(
    `
    with 
    attribute as (
     select * from attributes where id = ?
    ),
    groups as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', g.id,'name', g.name ))
     from groups g
     join attributes a on a.id = ?
     join attribute_group ag on ag.attribute_id = a.id
     and ag.group_id = g.id
    ),
    locals as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', l.id,'name', l.name,'label', al.label))
     from locals l
     join attributes a on a.id = ? 
     join attribute_local al on al.attribute_id = a.id
     and al.local_id = l.id
    ),
    choices as (
     select JSON_ARRAYAGG(choice)
     from attribute_choice where attribute_id = ?
    )
    
    select *, 
    (select cast(count(*) as char) from attribute_group where attribute_id = ? ) groups_count,
    (select * from groups) groups,
    (select cast(count(*) as char) from attribute_local where attribute_id = ? ) locals_count,
    (select * from locals) locals,
    (select cast(count(*) as char) from attribute_choice where attribute_id = ? ) choices_count,
    (select * from choices) choices
    from attribute
  `,
    Array.from({ length: 7 }, () => id) // id 7 times
  );
}

/*
// Get attribute by id with its groups and choices
*/
router.get('/attributes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const results = await getAttributeById(id);
    if (results.length < 1) throw '';
    const attribute = results[0];

    return res.json(attribute);
  } catch (err) {
    console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the attribute'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

// delete attr
router.delete('/attributes/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(`delete from attribute_choice where id = ?`, [id]);
  } catch (err) {
    console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while deleting the attribute'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

async function insertChoices(choices, conn, id) {
  const insert_choices = [];
  choices.forEach((choice) => {
    insert_choices.push([choice, id]);
  });

  let choices_query = `insert into attribute_choice (choice, attribute_id) values(?,?)`;
  await conn.batch(choices_query, insert_choices);
}

async function insertGroups(groups, conn, id) {
  const insert_groups = [];
  groups.forEach((group_id) => {
    insert_groups.push([group_id, id]);
  });
  const groups_query = `insert into attribute_group (group_id, attribute_id) values(?,?)`;
  await conn.batch(groups_query, insert_groups);
}

async function insertLocals(locals, conn, id) {
  const insert_locals = [];
  locals.forEach((local) => {
    insert_locals.push([local.id, local.label, id]);
  });
  const ls_query = `insert into attribute_local (local_id, label, attribute_id) values(?,?,?)`;
  await conn.batch(ls_query, insert_locals);
}

// post  attribute
async function postAttribute(body) {
  let {
    type,
    name,
    description,
    required,
    default_area,
    default_value,
    min,
    max,
    unit,
    choices,
    groups,
    locals
  } = body;

  const slug = name.replace(/[^0-9a-z]/gi, '') + '-' + new Date().getTime();
  required = required ? 1 : 0;

  try {
    const values = [
      type,
      name,
      slug,
      description,
      required,
      default_value,
      min,
      max,
      unit,
      default_area
    ];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const query = `insert into attributes ( 
      type, name ,slug, description, required, default_value, min, max, unit, default_area
    ) values(?,?,?,?,?,?,?,?,?,?)`;

    const res = await conn.query(query, values);
    const attribute_id = res.insertId;

    // Choices ---
    if (typeof choices !== 'undefined' && choices.length > 0) {
      await insertChoices(choices, conn, attribute_id);
    }

    //- Locals
    await insertLocals(locals, conn, attribute_id);

    // groups --
    if (typeof groups !== 'undefined' && groups.length > 0) {
      await insertGroups(groups, conn, attribute_id);
    }

    await conn.commit();
    return attribute_id;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/attributes', async (req, res) => {
  try {
    const body = req.body;
    const errs = await validateAttribute(body);

    generateValidationErrosResponse(errs);

    if (postAttribute(req.body)) {
      const attribute_id = await postAttribute(req.body);
      const message = 'Attribute saved successfully';
      const results = await getAttributeById(attribute_id);
      if (results.length < 1) throw '';
      const attribute = results[0];
      return res.status(201).json({ message, attribute });
    }
  } catch (err) {
    console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while saving the attribute'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

// post  attribute
async function updateAttribute(body, id) {
  let {
    type,
    name,
    description,
    required,
    default_area,
    default_value,
    min,
    max,
    unit,
    choices,
    groups,
    locals
  } = body;

  required = required ? 1 : 0;

  try {
    const values = [
      type,
      name,
      description,
      required,
      default_value,
      min,
      max,
      unit,
      default_area,
      id
    ];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const query = `update attributes set
      type = ?, name = ?, description = ?, required = ?,
      default_value = ?, min = ?, max = ?, unit = ?,
      default_area = ?
      where id = ?`;

    await conn.query(query, values);

    // Choices ---
    if (typeof choices !== 'undefined' && choices.length > 0) {
      // remove all
      pool.query(`delete from attribute_choice where attribute_id = ?`, [id]);
      await insertChoices(choices, conn, id);
    }

    //- Locals
    pool.query(`delete from attribute_local where attribute_id = ?`, [id]);
    await insertLocals(locals, conn, id);

    // groups --
    if (typeof groups !== 'undefined' && groups.length > 0) {
      pool.query(`delete from attribute_group where attribute_id = ?`, [id]);
      await insertGroups(groups, conn, id);
    }

    await conn.commit();
    return id;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.patch('/attributes/:id', async (req, res) => {
  try {
    const body = req.body;
    const errs = await validateAttribute(body);
    generateValidationErrosResponse(errs);

    const id = req.params.id;
    if (updateAttribute(req.body)) {
      const attribute_id = await updateAttribute(req.body, id);
      const message = 'Attribute saved successfully';
      const results = await getAttributeById(attribute_id);
      if (results.length < 1) throw '';
      const attribute = results[0];
      return res.status(201).json({ message, attribute });
    }
  } catch (err) {
    console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while saving the attribute'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

module.exports = router;
