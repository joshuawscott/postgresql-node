"use strict";
console.log("Testing MessageSender");
var assert = require('assert');
var messageSender = require('../lib/message_sender');

var buf;
var expected;

// cancelRequest
expected = new Buffer([0, 0, 0, 0x10,
  0x04, 0xd2, 0x16, 0x2e, // 80877102
  0, 0, 0, 0x01,
  0, 0, 0, 0x02]);

console.log("#cancelRequest returns correct buffer");
buf = messageSender.cancelRequest(1, 2);
assert.deepEqual(buf, expected);

// close
expected = new Buffer([0x43, // 'C'
  0, 0, 0, 0x09,
  0x73, // 's'
  0x66, 0x6F, 0x6F, 0]); // 'foo\0'

console.log("#close returns correct buffer");
buf = messageSender.close('s', 'foo');
assert.deepEqual(buf, expected);

// copyData
// TODO

// copyDone
expected = new Buffer([0x63, // 'c'
  0, 0, 0, 0x04]);

console.log("#copyDone returns correct buffer");
buf = messageSender.copyDone();
assert.deepEqual(buf, expected);

// copyFail
// TODO

// describe
// TODO

// execute
// TODO

// flush
expected = new Buffer([0x48, // 'H'
  0, 0, 0, 0x04]);

console.log("#flush returns correct buffer");
buf = messageSender.flush();
assert.deepEqual(buf, expected);

// functionCall
// TODO

// parse
// TODO

// passwordMessage
expected = new Buffer([0x70, // 'p'
  0, 0, 0, 0x8,
  0x66, 0x6F, 0x6F, 0]); // 'foo\0'

console.log("#passwordMessage returns correct buffer");
buf = messageSender.passwordMessage('foo', false, 'user', new Buffer([0x00, 0x00, 0x00, 0x00]));
assert.deepEqual(buf, expected);

console.log("#passwordMessage defaults to unencrypted");
buf = messageSender.passwordMessage('foo');
assert.deepEqual(buf, expected);

console.log("#passwordMessage sends encrypted password");
expected = new Buffer([
  0x70,
  0, 0, 0, 0x28,
  0x6d, 0x64, 0x35, 0x62, 0x65, 0x62, 0x38, 0x33, 0x32, 0x61, 0x30, 0x31, 0x38, 0x61, 0x36, 0x31, 0x66, 0x38, 0x66, 0x63, 0x38, 0x33, 0x34, 0x35, 0x63, 0x66, 0x39, 0x34, 0x66, 0x36, 0x66, 0x39, 0x35, 0x64, 0x38, 0
]);
buf = messageSender.passwordMessage('foo', true, 'foo', new Buffer([0x61, 0x61, 0x61, 0x61]));
assert.deepEqual(buf, expected);

// query
expected = new Buffer([0x51, // 'Q'
  0, 0, 0, 0x1e, // 30
  0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, // "SELECT "
  0x4e, 0x4f, 0x57, 0x28, 0x29, 0x20, // "NOW() "
  0x41, 0x53, 0x20, // "AS "
  0x63, 0x75, 0x72, 0x72, 0x74, 0x69, 0x6d, 0x65, 0x3b, 0x00]); // "currtime;\0"

console.log("#query returns correct buffer");
buf = messageSender.query("SELECT NOW() AS currtime;");
assert.deepEqual(buf, expected);

// sslRequest
expected = new Buffer([0, 0, 0, 0x08,
  0x04, 0xd2, 0x16, 0x2f]); // 80877103

console.log("#sslRequest returns correct buffer");
buf = messageSender.sslRequest();
assert.deepEqual(buf, expected);

// startupMessage
expected = new Buffer([0, 0, 0, 0x23, // 35
  0, 0x03, 0x00, 0x00, // 196608
  0x75, 0x73, 0x65, 0x72, 0, // 'user\0'
  0x70, 0x67, 0x75, 0x73, 0x65, 0x72, 0,// 'pguser\0'
  0x64, 0x61, 0x74, 0x61, 0x62, 0x61, 0x73, 0x65, 0, // 'database\0'
  0x6d, 0x79, 0x64, 0x62, 0, 0]); // 'mydb\0\0' - additional NUL to end the message.

console.log("#startupMessage returns correct buffer without optional options");
buf = messageSender.startupMessage('pguser', 'mydb');
assert.deepEqual(buf, expected);

// sync
expected = new Buffer([0x53, // 'S'
  0, 0, 0, 0x4]);

console.log("#sync returns correct buffer");
buf = messageSender.sync();
assert.deepEqual(buf, expected);
