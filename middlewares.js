module.exports = {
  auth: (req, res, next) => {
    if (req.session.user) {
      // LoggedIn
      if (req.url === '/login') return res.redirect('/');
      // if (req.method.toUpperCase() === 'POST' && req.url === '/logout' ) return next();
      return next();
    } else {
      // Not LoggedIn -- only can get::Login and post::login ( ONLY 2 routes availabale)
      if (req.method.toUpperCase() === 'GET' && req.url === '/login')
        return next();

      if (req.method.toUpperCase() === 'GET') return res.redirect('/login');

      if (req.method.toUpperCase() === 'POST' && req.url === '/login')
        return next();
      return res.status(401).send('Unauthorized request');
    }
  },

  trim: (req, res, next) => {
    body = req.body;
    if (req.method === 'POST') {
      for (const key in body) {
        if (typeof body[key] === 'object' || Array.isArray(body[key])) {
          trim(body[key]);
        } else if (typeof body[key] === 'string') {
          body[key] = body[key].trim();
        }
      }
    }
    next();
  },

  flash: (req, res, next) => {
    res.locals.errs = req.session.errs;
    res.locals.old = req.session.data;
    res.locals.msg = req.session.msg;

    delete req.session.errs;
    delete req.session.data;
    delete req.session.msg;

    next();
  }
};
