/*jslint browser: false, node: true, indent: 2 */
"use strict";
console.log("Testing PostgresqlConnection");
var assert = require('assert');
var postgresqlConnection = require('../lib/postgresql_connection');
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
var str;
var parseConnectString = function (str) {
  return postgresqlConnection.parseConnectString(str);
};
console.log("#parseConnectString parses any possible string correctly");
for (str in testObj) {
  if (testObj.hasOwnProperty(str)) {
    assert.deepEqual(parseConnectString(str), testObj[str]);
  }
}