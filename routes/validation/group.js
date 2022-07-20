function validateGroup(name, description) {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;

  const errs = [];
  ///////////////// Name validation ////////////////////
  if (typeof name !== 'undefined') {
    if (name.length < 2) errs.push('Name field minimum length is 2 letters');
    if (name.length > 250)
      errs.push('Name field maximum length is 250 letters');
    if (name.search(alphaDashNumeric) === -1)
      errs.push(
        'Name field must contains only letters, numbers, space, dash or underscore'
      );
  } else errs.push('Name field is required');

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
