'use strict';

var dbm;
var type;
var seed;
// seeding
var bcrypt = require('bcryptjs');

const { Pool } = require('pg');
const pool = new Pool();

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

  const user = 'INSERT INTO users(name, username, password) VALUES($1, $2, $3)';
  const values = ['Hossam Maher', 'admin', password];
  pool.query(user, values);

  const en_lang =
    'INSERT INTO locals(name, abbreviation, direction) VALUES($1, $2, $3)';
  const values2 = ['English', 'en', 'left'];
  pool.query(en_lang, values2);

  const ar_lang =
    'INSERT INTO locals(name, abbreviation, direction) VALUES($1, $2, $3)';
  const values3 = ['Arabic', 'ar', 'right'];
  pool.query(ar_lang, values3);

  return;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
