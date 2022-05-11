require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const morgan = require('morgan');
// app.use(morgan('tiny'));

const session = require('express-session');
var fileStore = require('session-file-store')(session);
app.use(
  session({
    store: new fileStore(),
    secret: process.env.KEY,
    saveUninitialized: true,
    resave: false,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development' ? false : true
    }
  })
);

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// view-engine
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.set('view engine', 'ejs');

const { auth, trim } = require('./middlewares');
app.use(auth);
app.use(trim);

app.use('/', require('./routes/auth'));
const flash = require('connect-flash');
app.use(flash());
app.use(function (req, res, next) {
  res.locals.message = req.flash('msg'); // success msg
  res.locals.errs = req.flash('errs'); // validation errors
  res.locals.data = req.flash('data'); // form data
  next();
});
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
