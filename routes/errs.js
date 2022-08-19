module.exports.generateValidationErrorsResponse = (errs, res) => {
  if (errs.length > 0) {
    const validationErrors = [];
    errs.forEach((err) => {
      validationErrors.push({
        type: 'validation',
        err
      });
    });
    const response = { errors: validationErrors };
    return res.status(422).json(response).end();
  }
};

module.exports.generateValGeneralErrorResponse = (
  err = 'General Error happened, please contact your adminstrator',
  res,
  status = 422
) => {
  const response = {
    errors: {
      type: 'general',
      err
    }
  };
  return res.status(status).json(response).end();
};
