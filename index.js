require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// const morgan = require('morgan');
// if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'));

const session = require('express-session');
const MariaDBStore = require('express-session-mariadb-store');

app.use(
  session({
    store: new MariaDBStore({
      pool: require('./config/db_pool')
    }),
    name: 'sid',
    secret: process.env.KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development' ? false : true
    }
  })
);

const { engine } = require('express-handlebars');
const helpers = require('handlebars-helpers')();
// ['math', 'string']

app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    // partials: path.join(__dirname, 'views/partials'),
    helpers
  })
);
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

const { auth, trim, flash } = require('./middlewares');
app.use(auth);
app.use(trim);
app.use(flash);

// Routes
app.use('/', require('./routes/attrs_router'));
app.use('/', require('./routes/auth_router'));

require('./config/db_pool');

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
