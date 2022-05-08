require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const morgan = require('morgan');
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// cookie-sessions
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const sessions = require('express-session');
var FileStore = require('session-file-store')(sessions);
var fileStoreOptions = {};
const oneDay = 1000 * 60 * 60 * 24;

app.use(
  sessions({
    store: new FileStore(fileStoreOptions),
    secret: process.env.KEY,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
  })
);

// view-engine
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.set('view engine', 'ejs');

app.use('/', require('./routes'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
