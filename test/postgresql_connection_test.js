/*jslint browser: false, node: true, indent: 2 */
var assert = require('assert');
var Target = require('../lib/postgresql_connection');
var testObj = {
  "postgresql://hostname": {
    comm: 'postgresql',
    hostname: 'hostname'
  },
  "postgresql://hostname/database": {
    comm: 'postgresql',
    hostname: 'hostname',
    database: 'database'
  },
  "postgresql://username@hostname": {
    comm: 'postgresql',
    username: 'username',
    hostname: 'hostname'
  },
  "postgresql://username@hostname/database": {
    comm: 'postgresql',
    username: 'username',
    hostname: 'hostname',
    database: 'database'
  },
  "postgresql://hostname:5432": {
    comm: 'postgresql',
    hostname: 'hostname',
    port: 5432
  },
  "postgresql://hostname:5432/database": {
    comm: 'postgresql',
    hostname: 'hostname',
    port: 5432,
    database: 'database'
  },
  "postgresql://username@hostname:5432": {
    comm: 'postgresql',
    username: 'username',
    hostname: 'hostname',
    port: 5432
  },
  "postgresql://username@hostname:5432/database": {
    comm: 'postgresql',
    username: 'username',
    hostname: 'hostname',
    port: 5432,
    database: 'database'
  },
  "postgresql://username:password@hostname": {
    comm: 'postgresql',
    username: 'username',
    password: 'password',
    hostname: 'hostname'
  },
  "postgresql://username:password@hostname/database": {
    comm: 'postgresql',
    username: 'username',
    password: 'password',
    hostname: 'hostname',
    database: 'database'
  },
  "postgresql://username:password@hostname:5432": {
    comm: 'postgresql',
    username: 'username',
    password: 'password',
    hostname: 'hostname',
    port: 5432
  },
  "postgresql://username:password@hostname:5432/database": {
    comm: 'postgresql',
    username: 'username',
    password: 'password',
    hostname: 'hostname',
    port: 5432,
    database: 'database'
  }
};

var _parseConnectString = function(str) {
  return Target._parseConnectString(str);
};
var retval;
for (var str in testObj) {
  assert.deepEqual(_parseConnectString(str), testObj[str]);
}