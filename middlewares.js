const { generateValGeneralErrorResponse } = require('./routes/errs');

module.exports = {
  // auth: (req, res, next) => {
  //   if (req.session.user) {
  //     // LoggedIn
  //     if (req.url === '/login') return res.redirect('/');

  //     return next();
  //   } else {
  //     // Not LoggedIn -- only can get::Login and post::login ( ONLY 2 routes availabale)
  //     if (req.method.toUpperCase() === 'GET' && req.url === '/login')
  //       return next();

  //     if (req.method.toUpperCase() === 'GET') return res.redirect('/login');

  //     if (req.method.toUpperCase() === 'POST' && req.url === '/login')
  //       return next();

  //     return res.status(401).send('Unauthorized request');
  //   }
  // },

  auth: (req, res, next) => {
    if (req.session.user) {
      // so /logout and /me  will work
      return next();
    } else {
      if (req.method.toUpperCase() === 'POST' && req.url === '/api/login') {
        return next();
      }
      // Not LoggedIn -- only can get::Login and post::login ( ONLY 2 routes availabale)
      return generateValGeneralErrorResponse('Unauthorized request', res, 401);
    }
  }

  // trim: (req, res, next) => {
  //   body = req.body;
  //   const trimmed = JSON.parse(
  //     JSON.stringify(body, (k, v) =>
  //       ['string', 'number'].includes(typeof v) ? v.trim() : v
  //     )
  //   );

  //   req.body = trimmed;
  //   next();
  // },

  // flash: (req, res, next) => {
  //   res.locals.errs = req.session.errs;
  //   res.locals.err = req.session.err;
  //   res.locals.old = req.session.old;
  //   res.locals.msg = req.session.msg;
  //   res.locals.user = req.session.user;
  //   res.locals.redirector = req.session.redirector;

  //   // console.log(res.locals);

  //   delete req.session.errs;
  //   delete req.session.err;
  //   delete req.session.old;
  //   delete req.session.msg;
  //   delete req.session.redirector;
  //   next();
  // }
};
