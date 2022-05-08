'use strict';

var dbm;
var type;
var seed;
// seeding
const bcrypt = require('bcrypt');

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

  const query =
    'INSERT INTO users(name, username, password) VALUES($1, $2, $3)';
  const values = ['Hossam Maher', 'admin', password];
  return pool.query(query, values);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
