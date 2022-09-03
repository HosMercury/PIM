const { generateValGeneralErrorResponse } = require('./routes/errs');

module.exports = {
  auth: (req, res, next) => {
    if (req.session.user) {
      // so /logout and /me  will work
      return next();
    } else {
      if (req.method.toUpperCase() === 'POST' && req.url === '/api/login') {
        return next();
      }

      // Not LoggedIn -- only can get::Login and post::login ( ONLY 2 routes availabale)
      return generateValGeneralErrorResponse(res, 'Unauthorized request', 401);
    }
  }
};
