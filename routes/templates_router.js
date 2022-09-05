const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validateTemplate = require('../validation/template');
const {
  generateValidationErrorsResponse,
  generateValGeneralErrorResponse
} = require('./errs');

let conn;

router.get('/templates', async (req, res) => {
  try {
    let templates = await pool.query(`
    select t.* ,
    JSON_ARRAYAGG(JSON_OBJECT('id', a.id,'name', a.name)) as attributes,
    JSON_ARRAYAGG(JSON_OBJECT('id', g.id,'name', g.name)) as groups,
    (select cast(count(*) as char) from attribute_template at where at.template_id = t.id) attributes_count,
    (select cast(count(*) as char) from group_template gt where gt.template_id = t.id) groups_count
    from templates t
    left join attribute_template at on t.id = at.template_id
    left join attributes a on a.id = at.attribute_id
    left join group_template gt on t.id = gt.template_id
    left join groups g on g.id = gt.group_id
    group by t.id order by t.id desc
    `);
    templates.forEach((template) => {
      return Object.keys(template).forEach((key) => {
        if (!template[key]) {
          delete template[key];
        }
        if (key === 'attributes_count' || key === 'groups_count') {
          template[key] = parseInt(template[key]) || 0;
        }

        if (template.attributes_count === 0) {
          delete template.attributes;
        }
        if (template.groups_count === 0) {
          delete template.groups;
        }
      });
    });
    return res.status(200).json({ templates });
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the templates'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query(`delete from templates where id = ?`, [id]);
    return res.status(204).end();
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while deleting the template'
        }
      ]
    };
    return res.status(400).json(response);
  }
});

async function getTemplateById(id) {
  return await pool.query(
    `
    with 
    template as (
     select * from templates where id = ?
    ),
    attributes as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', a.id,'name', a.name ))
     from attributes a
     join templates t on t.id = ?
     join attribute_template at on at.attribute_id = a.id
     and at.template_id = t.id
    ),
    groups as (
     select JSON_ARRAYAGG(
     JSON_OBJECT('id', g.id,'name', g.name))
     from groups g
     join templates t on t.id = ?
     join group_template gt on gt.group_id = g.id
     and gt.template_id = t.id
    )
    
    select *, 
    (select cast(count(*) as char) from attribute_group where group_id = ? ) attributes_count,
    (select * from attributes) attributes,
    (select cast(count(*) as char) from group_template where group_id = ? ) groups_count,
    (select * from groups) groups
    from template
  `,
    Array.from({ length: 7 }, () => id)
  );
}

const cleanTemplate = (template) => {
  Object.keys(template).forEach((k) => {
    if (!template[k]) {
      delete template[k];
    }
    if (k === 'attributes_count' || k === 'groups_count') {
      template[k] = parseInt(template[k]) || 0;
    }
  });

  return template;
};

// Get --
router.get('/templates/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const results = await getTemplateById(id);

    if (results.length < 1) {
      return generateValGeneralErrorResponse(res);
    }

    let template = results[0];
    template = cleanTemplate(template);

    return res.json({ template }).end();
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while fetching the template'
        }
      ]
    };
    return res.status(400).json(response).end();
  }
});

async function insertAttributes(attributes, conn, template_id) {
  const insert_attributes = [];
  attributes.forEach((attribute_id) => {
    insert_attributes.push([attribute_id, template_id]);
  });
  const attrs_query = `insert into attribute_template ( attribute_id, template_id) values(?,?)`;
  await conn.batch(attrs_query, insert_attributes);
}

async function insertGroups(groups, conn, template_id) {
  const insert_groups = [];
  groups.forEach((grp_id) => {
    insert_groups.push([grp_id, template_id]);
  });
  const gps_query = `insert into group_template (group_id,template_id)  values(?,?)`;
  await conn.batch(gps_query, insert_groups);
}

async function postTemplate(body) {
  let { name, description, attributes, groups } = body;

  try {
    let values = [name, description];

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const query = `insert into templates (name , description) values(?,?)`;

    const res = await conn.query(query, values);

    const template_id = res.insertId;

    //- Locals
    if (typeof attributes !== 'undefined' && attributes.length > 0) {
      await insertAttributes(attributes, conn, template_id);
    }

    // groups --
    if (typeof groups !== 'undefined' && groups.length > 0) {
      await insertGroups(groups, conn, template_id);
    }

    await conn.commit();
    await conn.release();
    return template_id;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/templates', async (req, res) => {
  try {
    const body = req.body;
    const errs = await validateTemplate(body);

    if (errs.length > 0) {
      return generateValidationErrorsResponse(errs, res);
    }

    if ((template_id = await postTemplate(req.body))) {
      const message = 'Template saved successfully';
      const results = await getTemplateById(template_id);
      if (results.length < 1) {
        return generateValGeneralErrorResponse(res);
      }
      const template = results[0];
      return res.status(201).json({ message, template });
    }
  } catch (err) {
    console.log(err);
    return generateValGeneralErrorResponse(res);
  }
});

router.patch('/templates/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const oldTemp = await getTemplateById(id);
    if (oldTemp.length < 1) {
      return generateValGeneralErrorResponse(res);
    }

    const errs = await validateTemplate(body, oldTemp[0]);

    if (errs.length > 0) {
      return generateValidationErrorsResponse(errs, res);
    }
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

    const sent_grs_ids = req.body.templates || [];
    // Validate sent groups ids
    let all_groups_ids = await pool.query(
      `select JSON_ARRAYAGG(id) templates from templates`
    );

    // if all_attributes_ids the value of all_attributes_ids[0.attributes IS NULL]
    all_groups_ids = all_groups_ids[0].groups;

    if (all_groups_ids && sent_grs_ids.length > 0) {
      sent_grs_ids.map((template) => {
        if (!all_groups_ids.includes(parseInt(template))) {
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
      `update templates set name = ? ,description = ? where id = ?`,
      [body.name, body.description, id]
    );

    await conn.batch(`delete from attribute_group where template_id = ?`, [id]);

    if (sent_attrs_ids.length > 0) {
      const values = sent_attrs_ids.map((attribute_id) => [id, attribute_id]);
      await conn.batch(
        `insert into attribute_group (group_id, attribute_id) values (?, ?)`,
        values
      );
    }

    await conn.batch(`delete from group_template where template_id = ?`, [id]);

    if (sent_temps_ids.length > 0) {
      const values = sent_temps_ids.map((temp_id) => [id, temp_id]);
      await conn.batch(
        `insert into group_template (group_id, template_id) values (?, ?)`,
        values
      );
    }

    await conn.commit();
    const message = 'Template updated successfully';
    const result = await getTemplateById(id);
    if (result.length < 1) {
      return generateValGeneralErrorResponse(res);
    }
    let group = result[0];

    group = cleanTemplate(template);

    res.status(201).json({ message, template });

    return res.end();
  } catch (err) {
    // console.log(err);
    const response = {
      errors: [
        {
          type: 'general',
          err: 'Error while editing the template'
        }
      ]
    };
    res.status(400).json(response);
    return res.end();
  }
});

module.exports = router;
