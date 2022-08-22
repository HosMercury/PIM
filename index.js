require('dotenv').config();
const express = require('express');
const app = express();
const port = 4000;
const path = require('path');

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const morgan = require('morgan');
if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'));

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

const { auth } = require('./middlewares');
app.use(auth);

// Routes
app.use('/api', require('./routes/auth_router'));
app.use('/api', require('./routes/attrs_router'));
app.use('/api', require('./routes/groups_router'));

require('./config/db_pool');

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
