require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const cookieParser = require('cookie-parser');
const morgan = require('morgan');
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.set('view engine', 'ejs');

app.use('/', require('./routes'));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
