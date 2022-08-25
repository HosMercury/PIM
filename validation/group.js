const pool = require('../config/db_pool');

async function validateGroup(name, description, id = null) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const errs = [];

  ///////////////// Name validation ////////////////////
  if (typeof name !== 'undefined') {
    try {
      const groups_names = await pool.query(
        `select json_arrayagg(LOWER(name)) as group_names from groups`
      );

      const names = groups_names[0].group_names;

      if (names.includes(name.trim().toLowerCase())) {
        errs.push('Group name is already exists');
      }

      if (name.length < 2) errs.push('Name field minimum length is 2 letters');
      if (name.length > 250)
        errs.push('Name field maximum length is 250 letters');
      if (name.search(alphaDashNumeric) === -1)
        errs.push(
          'Name field must contains only letters, numbers, space, dash or underscore'
        );
    } catch (e) {
      errs.push('DB Error while validating the group data');
    }
  } else {
    errs.push('Name field is required');
  }

  //////////  Description //////////////
  if (description !== '') {
    if (description.length < 2)
      errs.push('Description field minimum length is 2 letters');
    if (description.length > 250)
      errs.push('Description field maximum length is 250 letters');
  }
  return errs;
}

module.exports = validateGroup;
