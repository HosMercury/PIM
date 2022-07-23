const express = require('express');
const router = express.Router();
const pool = require('../config/db_pool');
const validateAttribute = require('./validation/attr');
const { isNumeric } = require('validator');
const moment = require('moment');

let conn;

router.get('/', (req, res) => {
  return res.render('index', {
    title: 'Dashboard'
  });
});

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

router.get('/attributes/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const results = await pool.query('select * from attributes where id = ?', [
      id
    ]);

    if (results.length < 1) throw new Error('invalid attribute');
    const attribute = results[0];

    const attr_groups = await pool.query(
      `
        select g.id, g.name from groups g
        left join attribute_groups ag on g.id = ag.group_id
        left join attributes a on a.id = ag.attribute_id 
        where a.id = ?
    `,
      [id]
    );
    const attr_groups_ids = attr_groups.map((g) => g.id);

    const groups = await pool.query(`select id, name from groups`, [id]);
    const labels = await pool.query(
      'select id, name, abbreviation, direction from locals'
    );

    const attr_labels = await pool.query(
      `
        select l.abbreviation, al.label 
        from locals l
        left join attribute_labels al on l.id = al.local_id
        left join attributes a on a.id = al.attribute_id 
        where a.id = ?
    `,
      [id]
    );

    const remapped_labels = Object.fromEntries(
      attr_labels.map(({ abbreviation, label }) => [abbreviation, label])
    );

    const choices_results = await pool.query(
      `select name from attribute_choices where attribute_id = ?`,
      [id]
    );
    const choices = choices_results.map((choice) => choice.name);

    return res.status(200).render('attrs/show', {
      title: 'Attribute : ' + attribute.name,
      attribute,
      attr_groups,
      attr_groups_ids,
      labels,
      remapped_labels,
      choices,
      groups,
      moment
    });
  } catch (err) {
    console.log(err);
    req.session.err = 'Error while fetching the attribute';
    return res.status(400).redirect('/attributes');
  }
});

// delete attr
router.post('/attributes/:id/delete', async (req, res) => {
  if (await deleteAttribute(req)) {
    req.session.msg = 'Attribute deleted successfully';
    return res.status(200).redirect('/attributes');
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
        select a.id, a.name, a.type, a.slug, a.created_at, al.label label,
        (select cast(count(*) as char) from attribute_groups ag where ag.attribute_id = a.id) groups_count,
        (select cast(count(*) as char) from attribute_labels al where al.attribute_id = a.id) labels_count,
        (select cast(count(*) as char) from attribute_choices ac where ac.attribute_id = a.id) choices
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

    return res.render('attrs/index', {
      title: 'Attributes',
      button: 'Create Attribute',
      buttonClass: 'create-attribute',
      labels,
      groups
    });
  } catch (err) {
    req.session.err = 'Error while fetching the attributes';
    return res.status(400).redirect('back');
  }
});

// post  attribute or edit existing one
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
    if (typeof id !== undefined && isNumeric(id)) {
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

        choices.forEach(async (choice) => {
          let _options_query = `insert into attribute_choices (name, attribute_id) values(?,${id})`;
          await conn.batch(_options_query, choice);
        });
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
      // --------------- Create new attribute -------------------/////
      ////////////////////////////////////////////////////////////////
      const res = await conn.query(query, values);
      const attr_id = res.insertId;

      // Choices ---

      if (typeof choices !== 'undefined' && choices.length > 0) {
        const chcs_array = [];
        choices.forEach((choice) => {
          chcs_array.push([choice, attr_id]);
        });
        const options_query = `insert into attribute_choices (name, attribute_id) values(?,?)`;
        await conn.batch(options_query, chcs_array);
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
    return true;
  } catch (err) {
    console.log(err);
    await conn.rollback();
    return false;
  }
}

router.post('/attributes', async (req, res) => {
  const errs = await validateAttribute(req.body);
  if (errs.length > 0) {
    req.session.redirector = 'attribute';
    req.session.errs = errs;
    req.session.old = req.body;
    return res.status(400).redirect('back');
  }

  const success = await postAttribute(req.body);

  if (!success) {
    req.session.err = 'Error while saving the attribute';
    return res.status(400).redirect('back');
  } else {
    req.session.msg = 'Attribute saved successfully';
    return res.status(200).redirect('back');
  }
});

module.exports = router;

// select a.* ,
// JSON_ARRAYAGG(JSON_OBJECT('id', g.id,'name', g.name)) as groups
// ,JSON_ARRAYAGG(JSON_OBJECT("id", al.local_id, "abbreviation",l.abbreviation,"name", al.label)) as locals
// ,JSON_ARRAYAGG(JSON_OBJECT('id', ac.id,"name", ac.name)) as choices,
// (select cast(count(*) as char) from attribute_groups ag where ag.attribute_id = a.id) groups_count,
// (select cast(count(*) as char) from attribute_labels al where al.attribute_id = a.id) labels_count,
// (select cast(count(*) as char) from attribute_choices ac where ac.attribute_id = a.id) choices_count
// FROM attributes a
// left join attribute_groups ag on a.id = ag.attribute_id
// left join groups g on g.id = ag.group_id
// left join attribute_labels al on a.id = al.attribute_id
// left join locals l on l.id = al.local_id
// left join attribute_choices ac on a.id = ac.attribute_id
// group by a.id
// order by a.id desc limit 10000
