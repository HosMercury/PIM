module.exports.generateValidationErrorsResponse = (errs, res) => {
  if (errs.length > 0) {
    const validationErrors = [];
    errs.forEach((err) => {
      validationErrors.push({
        type: 'validation',
        err
      });
    });
    const response = { erros: validationErrors };
    return res.status(422).json(response);
  }
};

module.exports.generateValGeneralErrorResponse = (res) => {
  const response = {
    erros: {
      type: 'general',
      err: 'General Error happened, please contact your adminstrator'
    }
  };
  return res.status(422).json(response);
};
