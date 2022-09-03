const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validateGroup = require('../validation/group');
const moment = require('moment');
const {
  generateValidationErrorsResponse,
  generateValGeneralErrorResponse
} = require('./errs');
const { parse } = require('date-fns');
let conn;

router.get('/groups', async (req, res) => {
  try {
    let groups = await pool.query(`
    select g.* ,
    JSON_ARRAYAGG(JSON_OBJECT('id', a.id,'name', a.name)) as attributes,
    JSON_ARRAYAGG(JSON_OBJECT('id', t.id,'name', t.name)) as templates,
    (select cast(count(*) as char) from attribute_group ag where ag.group_id = g.id) attributes_count,
          (select cast(count(*) as char) from group_template gt where gt.group_id = g.id) templates_count
    from groups g
    left join attribute_group ag on g.id = ag.group_id
    left join attributes a on a.id = ag.attribute_id
    left join group_template gt on g.id = gt.group_id
    left join templates t on t.id = gt.template_id
    group by g.id order by g.id desc
    `);

    groups.forEach((group) => {
      return Object.keys(group).forEach((key) => {
        if (!group[key]) {
          delete group[key];
        }
        if (key === 'attributes_count' || key === 'templates_count') {
          group[key] = parseInt(group[key]);
        }

        if (group.attributes_count === 0) {
          delete group.attributes;
        }
        if (group.templates_count === 0) {
          delete group.templates;
        }
      });
    });
    return res.status(200).json({ groups });
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the groups'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(`delete from groups where id = ?`, [id]);
    return res.status(204).end();
  } catch (err) {
    // console.log(err);
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

async function getGroupById(id) {
  return await pool.query(
    `
    with 
    grp as (
     select * from groups where id = ?
    ),
    attributes as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', a.id,'name', a.name ))
     from attributes a
     join groups g on g.id = ?
     join attribute_group ag on ag.attribute_id = a.id
     and ag.group_id = g.id
    ),
    templates as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', t.id,'name', t.name))
     from templates t
     join groups g on g.id = ?
     join group_template gt on gt.template_id = t.id
     and gt.group_id = g.id
    )
    
    select *, 
    (select cast(count(*) as char) from attribute_group where group_id = ? ) attributes_count,
    (select * from attributes) attributes,
    (select cast(count(*) as char) from group_template where group_id = ? ) templates_count,
    (select * from templates) templates
    from grp
  `,
    Array.from({ length: 7 }, () => id)
  );
}

const cleanGroup = (group) => {
  Object.keys(group).forEach((k) => {
    if (!group[k]) {
      delete group[k];
    }
    if (k === 'attributes_count' || k === 'templates_count') {
      group[k] = parseInt(group[k]) || 0;
    }
  });

  return group;
};

// Get --
router.get('/groups/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const results = await getGroupById(id);

    if (results.length < 1) {
      generateValGeneralErrorResponse(res);
    }

    let group = results[0];
    group = cleanGroup(group);

    return res.json({ group }).end();
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the group'
        }
      ]
    };
    return res.status(400).json(response).end();
  }
});

async function insertAttributes(attributes, conn, id) {
  const insert_attributes = [];
  attributes.forEach((attribute_id) => {
    insert_attributes.push([attribute_id, id]);
  });
  const attrs_query = `insert into attribute_group ( attribute_id, group_id) values(?,?)`;
  await conn.batch(attrs_query, insert_attributes);
}

async function insertTemplates(templates, conn, id) {
  const insert_templates = [];
  templates.forEach((temp_id) => {
    insert_templates.push([temp_id, id]);
  });
  const temps_query = `insert into group_template (template_id, group_id) values(?,?)`;
  await conn.batch(temps_query, insert_templates);
}

async function postGroup(body) {
  let { name, description, attributes, templates } = body;

  try {
    let values = [name, description];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const query = `insert into groups (name , description) values(?,?)`;

    const res = await conn.query(query, values);

    const group_id = res.insertId;

    //- Locals
    if (typeof attributes !== 'undefined' && attributes.length > 0) {
      await insertAttributes(attributes, conn, group_id);
    }

    // groups --
    if (typeof templates !== 'undefined' && templates.length > 0) {
      await insertTemplates(templates, conn, group_id);
    }

    await conn.commit();
    await conn.release();
    return group_id;
  } catch (err) {
    // console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/groups', async (req, res) => {
  try {
    const body = req.body;
    const errs = await validateGroup(body);

    generateValidationErrorsResponse(errs, res);

    if ((group_id = await postGroup(req.body))) {
      const message = 'Group saved successfully';
      const results = await getGroupById(group_id);
      if (results.length < 1) {
        generateValGeneralErrorResponse(res);
      }
      const group = results[0];
      return res.status(201).json({ message, group });
    }
  } catch (err) {
    // console.log(err);
    generateValGeneralErrorResponse(res);
  }
});

router.patch('/groups/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const errs = await validateGroup(body, id);
    generateValidationErrorsResponse(errs, res);

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const sent_attrs_ids = req.body.attributes || [];
    // Validate sent groups ids
    let all_attributes_ids = await pool.query(
      `select JSON_ARRAYAGG(id) attributes from attributes`
    );

    // if all_attributes_ids the value of all_attributes_ids[0.attributes IS NULL]
    all_attributes_ids = all_attributes_ids[0].attributes;

    if (all_attributes_ids && sent_attrs_ids.length > 0) {
      sent_attrs_ids.map((attribute) => {
        if (!all_attributes_ids.includes(parseInt(attribute))) {
          const response = {
            errors: [
              {
                type: 'general',
                err: 'Attribute is not found'
              }
            ]
          };
          return res.status(400).json(response);
        }
      });
    }

    const sent_temps_ids = req.body.templates || [];
    // Validate sent groups ids
    let all_templates_ids = await pool.query(
      `select JSON_ARRAYAGG(id) templates from templates`
    );

    // if all_attributes_ids the value of all_attributes_ids[0.attributes IS NULL]
    all_templates_ids = all_templates_ids[0].templates;

    if (all_templates_ids && sent_temps_ids.length > 0) {
      sent_temps_ids.map((template) => {
        if (!all_templates_ids.includes(parseInt(template))) {
          const response = {
            errors: [
              {
                type: 'general',
                err: 'Template is not found'
              }
            ]
          };
          return res.status(400).json(response);
        }
      });
    }

    const results = await conn.batch(
      `update groups set name = ? ,description = ? where id = ?`,
      [body.name, body.description, id]
    );

    await conn.batch(`delete from attribute_group where group_id = ?`, [id]);

    if (sent_attrs_ids.length > 0) {
      const values = sent_attrs_ids.map((attribute_id) => [id, attribute_id]);
      await conn.batch(
        `insert into attribute_group (group_id, attribute_id) values (?, ?)`,
        values
      );
    }

    await conn.batch(`delete from group_template where group_id = ?`, [id]);

    if (sent_temps_ids.length > 0) {
      const values = sent_temps_ids.map((temp_id) => [id, temp_id]);
      await conn.batch(
        `insert into group_template (group_id, template_id) values (?, ?)`,
        values
      );
    }

    await conn.commit();
    const message = 'Group updated successfully';
    const result = await getGroupById(id);
    if (result.length < 1) generateValGeneralErrorResponse(res);
    let group = result[0];

    group = cleanGroup(group);

    res.status(201).json({ message, group });

    return res.end();
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while editing the group'
        }
      ]
    };
    res.status(400).json(response);
    return res.end();
  }
});

module.exports = router;
