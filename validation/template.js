const pool = require('../config/db_pool');

async function validateTemplate({ name, description }, oldTemp = null) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const errs = [];

  ///////////////// Name validation ////////////////////
  if (typeof name !== 'undefined') {
    name = name.trim();
    try {
      const templates_names = await pool.query(
        `select json_arrayagg(LOWER(name)) as template_names from templates`
      );

      const names = templates_names[0].templates_names;

      if ((oldTemp && name !== oldTemp.name) || !oldTemp) {
        if (names.includes(name.toLowerCase())) {
          errs.push('Template name is already exists');
        }
      }

      if (name.length < 2) errs.push('Name field minimum length is 2 letters');
      if (name.length > 250)
        errs.push('Name field maximum length is 250 letters');
      if (name.search(alphaDashNumeric) === -1)
        errs.push(
          'Name field must contains only letters, numbers, space, dash or underscore'
        );
    } catch (e) {
      // console.log(e);
      errs.push('DB Error while validating the template data');
    }
  } else {
    errs.push('Name field is required');
  }

  //////////  Description //////////////
  if (typeof description !== 'undefined' && description !== '') {
    if (description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }
  return errs;
}

module.exports = validateTemplate;
