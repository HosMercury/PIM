require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ejs = require('ejs');
ejs.delimiter = '?';
app.set('view engine', 'ejs');

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

// const morgan = require('morgan');
// if (process.env.NODE_ENV !== 'production') app.use(morgan('tiny'));

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
app.use(
  session({
    store: new pgSession({
      pool: require('./config/db'),
      tableName: 'session'
    }),
    name: 'SSid',
    secret: process.env.KEY,
    saveUninitialized: false,
    resave: false
    // cookie: {
    //   path: '/',
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'development' ? false : true
    // }
  })
);

// // view-engine
app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

// const flash = require('express-flash');
// app.use(flash());

const { auth, trim, flash } = require('./middlewares');
app.use(trim);
app.use(flash);
app.use(auth);

// Routes
app.get('/', (req, res) => res.render('index'));
app.use('/', require('./routes/auth'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
