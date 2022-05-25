function auth(req, res, next) {
  if (req.url === '/login' && !req.session.user) {
    next();
    return;
  }

  if (req.url === '/login' && req.session.user) {
    res.redirect('/dashboard');
    return;
  }

  if (typeof req.session.user === 'undefined' || !req.session.user) {
    res.redirect('/login');
    return;
  }

  next();
}

function trim(req, res, next) {
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
}

function flash(req, res, next) {
  res.locals.errs = req.session.errs;
  res.locals.data = req.session.data;
  res.locals.msg = req.session.msg;
  delete req.session.flash;
  next();
}

module.exports = { auth, trim, flash };
