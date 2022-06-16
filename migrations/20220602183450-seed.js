'use strict';

var dbm;
var type;
var seed;
// seeding
var bcrypt = require('bcryptjs');
const pool = require('../config/db_pool');

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const password = await bcrypt.hash(process.env.ADMIN_PASS, 8);

  const user =
    'insert into users(firstname,lastname, username, password) values(?, ?, ?, ?)';
  const values = ['Hossam', 'Maher', 'admin', password];
  await pool.query(user, values);

  const en_lang = 'insert into locals(language, abbreviation) values(?, ?)';
  const values2 = ['English USA', 'en-us'];
  await pool.query(en_lang, values2);

  const ar_lang =
    'insert into locals(language, abbreviation, direction) values(?, ?, ?)';
  const values3 = ['Arabic EGY', 'ar-eg', 'rtl'];
  await pool.query(ar_lang, values3);

  const g1 = 'insert into groups(name) values(?)';
  pool.query(g1, 'Basic');

  const g2 = 'insert into groups(name) values(?)';
  await pool.query(g2, 'Dimentions');

  const g3 = 'insert into groups(name) values(?)';
  await pool.query(g3, 'Size');

  const g4 = 'insert into groups(name) values(?)';
  await pool.query(g4, 'Rams');

  const g5 = 'insert into groups(name) values(?)';
  await pool.query(g5, 'Cpus');

  const g6 = 'insert into groups(name) values(?)';
  await pool.query(g6, 'Colours');

  const g7 = 'insert into groups(name) values(?)';
  await pool.query(g7, 'Motherboards');

  const g8 = 'insert into groups(name) values(?)';
  await pool.query(g8, 'Cases');

  return;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
