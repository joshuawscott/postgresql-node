"use strict";
console.log("Testing MessageParser");
var assert = require('assert');
var messageParser = require('../lib/message_parser');

var result,
  buf,
  expected,
  messageObj;

// Parse
console.log("#Parse parses two messages into array");
expected = {
  partialMessage: null,
  messages: [
    {
      type: 'K',
      objLength: 12,
      data: new Buffer([0, 0, 0, 0x01, 0, 0, 0, 0x02])
    },
    {
      type: 'C',
      objLength: 13,
      data: new Buffer([0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, 0x31, 0])
    }]
};
buf = new Buffer([
  0x4b, // K
  0, 0, 0, 0x0c, // 12
  0, 0, 0, 0x01, // 1
  0, 0, 0, 0x02, // 2
  0x43, // C
  0, 0, 0, 0x0d, // 13
  0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, 0x31, 0 // "SELECT 1\0"
]);
result = messageParser.Parse(buf);
assert.deepEqual(result, expected);

console.log("#Parse stores a partial message in partialMessage");
expected = {
  partialMessage: new Buffer([0x43, 0, 0, 0, 0x0d, 0x53, 0x45]),
  messages: [
    {
      type: 'K',
      objLength: 12,
      data: new Buffer([0, 0, 0, 0x01, 0, 0, 0, 0x02])
    }
  ]
};
buf = buf.slice(0, 20);
result = messageParser.Parse(buf);
assert.deepEqual(result, expected);

//// parseMessage

// authenticationOk
console.log("#parseMessage authenticationOk");
expected = {type: 'R', objLength: 8, data: new Buffer([0, 0, 0, 0])};
expected.eventName = 'authenticationOk';
messageObj = {type: 'R', objLength: 8, data: new Buffer([0, 0, 0, 0])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// authenticationKerberosV5
// TODO

// authenticationCleartextPassword
console.log("#parseMessage authenticationCleartextPassword");
expected = {type: 'R', objLength: 8, data: new Buffer([0, 0, 0, 3])};
expected.eventName = 'authenticationCleartextPassword';
messageObj = {type: 'R', objLength: 8, data: new Buffer([0, 0, 0, 3])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// authenticationMD5Password
console.log("#parseMessage authenticationMD5Password");
expected = {type: 'R', objLength: 12, data: new Buffer([0, 0, 0, 5, 0x61, 0x61, 0x61, 0x61])};
expected.eventName = 'authenticationMD5Password';
expected.salt = new Buffer([0x61, 0x61, 0x61, 0x61]);
messageObj = {type: 'R', objLength: 12, data: new Buffer([0, 0, 0, 5, 0x61, 0x61, 0x61, 0x61])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);


// authenticationGSS
// TODO

// authenticationSSPI
// TODO

// authenticationGSSContinue
// TODO

// backendKeyData
console.log("#parseMessage backendKeyData");
expected = {type: 'K', objLength: 12, data: new Buffer([0, 0, 0, 0x01, 0, 0, 0, 0x02])};
expected.processID = 1;
expected.secretKey = 2;
expected.eventName = 'backendKeyData';
messageObj = {type: 'K', objLength: 12, data: new Buffer([0, 0, 0, 0x01, 0, 0, 0, 0x02])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// bindComplete
console.log("#parseMessage bindComplete");
expected = {type: '2', objLength: 4, data: new Buffer(0)};
expected.eventName = 'bindComplete';
messageObj = {type: '2', objLength: 4, data: new Buffer(0)};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// closeComplete
console.log("#parseMessage closeComplete");
expected = {type: '3', objLength: 4, data: new Buffer(0)};
expected.eventName = 'closeComplete';
messageObj = {type: '3', objLength: 4, data: new Buffer(0)};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// commandComplete
console.log("#parseMessage commandComplete");
expected = {type: 'C', objLength: 13, data: new Buffer([0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, 0x31, 0])};
expected.eventName = 'commandComplete';
expected.commandComplete = true;
expected.commandCompleteResult = 'SELECT 1';
messageObj = {type: 'C', objLength: 13, data: new Buffer([0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, 0x31, 0])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// copyData
console.log("#parseMessage copyData");
expected = {type: 'd', objLength: 12, data: new Buffer([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])};
expected.copyData = expected.data.toString('utf-8');
expected.eventName = 'copyData';
messageObj = {type: 'd', objLength: 12, data: new Buffer([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// copyDone
console.log("#parseMessage copyDone");
expected = {type: 'c', objLength: 4};
expected.eventName = 'copyDone';
expected.copyDone = true;
messageObj = {type: 'c', objLength: 4};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// copyInResponse

// TODO

// copyOutResponse
// TODO

// copyBothResponse
// TODO

// dataRow
console.log("#parseMessage dataRow");
expected = {
  type: 'D',
  objLength: 0,
  data: new Buffer(
    [
      0x00, 0x02,
      0x00, 0x00, 0x00, 0x03,
      0x66, 0x6f, 0x6f, // 'foo'
      0x00, 0x00, 0x00, 0x03,
      0x62, 0x61, 0x72 // 'bar'
    ]
  )
};
expected.rowValue = ['foo', 'bar'];
expected.data = undefined;
expected.eventName = 'dataRow';
messageObj = {
  type: 'D',
  objLength: 0,
  data: new Buffer(
    [
      0x00, 0x02,
      0x00, 0x00, 0x00, 0x03,
      0x66, 0x6f, 0x6f, // 'foo'
      0x00, 0x00, 0x00, 0x03,
      0x62, 0x61, 0x72  // 'bar'
    ]
  )
};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// emptyQueryResponse
// TODO

// errorResponse
console.log("#parseMessage errorResponse");
expected = {
  type: 'E',
  objLength: 32,
  data: new Buffer(
    [
      0x53, // 'S'
      0x45, 0x52, 0x52, 0x4f, 0x52, 0, // 'ERROR\0'
      0x43, // 'C'
      0x34, 0x32, 0x36, 0x30, 0x31, 0, // '42601\0'
      0x4d, // 'M'
      0x53, 0x79, 0x6e, 0x74, 0x61, 0x78, 0x20, 0x45, 0x72, 0x72, 0x6f, 0x72, 0 // 'Syntax Error\0'
    ]
  )
};
expected.eventName = 'errorResponse';
expected.errorMessages = {
  S: 'ERROR',
  C: '42601',
  M: 'Syntax Error'
};
messageObj = {
  type: 'E',
  objLength: 32,
  data: new Buffer(
    [
      0x53, // 'S'
      0x45, 0x52, 0x52, 0x4f, 0x52, 0, // 'ERROR\0'
      0x43, // 'C'
      0x34, 0x32, 0x36, 0x30, 0x31, 0, // '42601\0'
      0x4d, // 'M'
      0x53, 0x79, 0x6e, 0x74, 0x61, 0x78, 0x20, 0x45, 0x72, 0x72, 0x6f, 0x72, 0 // 'Syntax Error\0'
    ]
  )
};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// functionCallResponse
// TODO

// noData
console.log("#parseMessage noData");
expected = {type: 'n', objLength: 4};
expected.eventName = 'noData';
expected.noData = true;
messageObj = {type: 'n', objLength: 4};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// noticeResponse
console.log("#parseMessage noticeResponse");
expected = {
  type: 'N',
  objLength: 32,
  data: new Buffer(
    [
      0x53, // 'S'
      0x45, 0x52, 0x52, 0x4f, 0x52, 0, // 'ERROR\0'
      0x43, // 'C'
      0x34, 0x32, 0x36, 0x30, 0x31, 0, // '42601\0'
      0x4d, // 'M'
      0x53, 0x79, 0x6e, 0x74, 0x61, 0x78, 0x20, 0x45, 0x72, 0x72, 0x6f, 0x72, 0 // 'Syntax Error\0'
    ]
  )
};
expected.eventName = 'noticeResponse';
expected.noticeMessages = {
  S: 'ERROR',
  C: '42601',
  M: 'Syntax Error'
};
messageObj = {
  type: 'N',
  objLength: 32,
  data: new Buffer(
    [
      0x53, // 'S'
      0x45, 0x52, 0x52, 0x4f, 0x52, 0, // 'ERROR\0'
      0x43, // 'C'
      0x34, 0x32, 0x36, 0x30, 0x31, 0, // '42601\0'
      0x4d, // 'M'
      0x53, 0x79, 0x6e, 0x74, 0x61, 0x78, 0x20, 0x45, 0x72, 0x72, 0x6f, 0x72, 0 // 'Syntax Error\0'
    ]
  )
};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// notificationReponse
// TODO

// parameterDescription
// TODO

// parameterStatus
console.log("#parseMessage parameterStatus");
expected = {
  type: 'S',
  objLength: 4,
  data: new Buffer(
    [
      0x66, 0x6f, 0x6f, 0, // 'foo\0'
      0x62, 0x61, 0x72, 0 // 'bar\0'
    ]
  )

};
expected.eventName = 'parameterStatus';
expected.parameterKey = 'foo';
expected.parameterValue = 'bar';
messageObj = {
  type: 'S',
  objLength: 4,
  data: new Buffer(
    [
      0x66, 0x6f, 0x6f, 0, // 'foo\0'
      0x62, 0x61, 0x72, 0 // 'bar\0'
    ]
  )
};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// parseComplete
// TODO

// portalSuspended
// TODO

// readyForQuery
console.log("#parseMessage readyForQuery 'I'");
expected = {type: 'Z', objLength: 4, data: new Buffer([0x49])};
expected.eventName = 'readyForQuery';
expected.transactionStatusIndicator = 'I';
messageObj = {type: 'Z', objLength: 4, data: new Buffer([0x49])};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

console.log("#parseMessage readyForQuery 'T'");
expected.data = new Buffer([0x54]);
expected.transactionStatusIndicator = 'T';
messageObj.data = new Buffer([0x54]);
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

console.log("#parseMessage readyForQuery 'E'");
expected.data = new Buffer([0x45]);
expected.transactionStatusIndicator = 'E';
messageObj.data = new Buffer([0x45]);
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

// rowDescription
console.log("#parseMessage rowDescription");
expected = {
  type: 'T',
  objLength: 50,
  data: new Buffer(
    [
      0, 0x02, // # of fields
      0x66, 0x6f, 0x6f, 0, // 'foo\0' field name
      0, 0, 0, 0x01, // objectID of parent table
      0, 0x00, // attribute number (0-based)
      0, 0, 0, 0x02, // objectID of data type
      0, 0x03, // data type size
      0, 0, 0, 0x04, // type modifier
      0, 0x00, // format code
      0x62, 0x61, 0x72, 0, // 'bar\0'
      0, 0, 0, 0x11, // objectID of parent table
      0, 0x01, // attribute number (0-based)
      0, 0, 0, 0x12, // objectID of data type
      0, 0x13, // data type size
      0, 0, 0, 0x14, // type modifier
      0, 0x00 // format code
    ]
  )
};
expected.eventName = 'rowDescription';
expected.rowDescription = [
  {
    fieldName: 'foo',
    parentTableObjectID: 1,
    attributeNumber: 0,
    dataTypeObjectID: 2,
    dataTypeSize: 3,
    typeModifier: 4,
    formatCode: 0
  },
  {
    fieldName: 'bar',
    parentTableObjectID: 17,
    attributeNumber: 1,
    dataTypeObjectID: 18,
    dataTypeSize: 19,
    typeModifier: 20,
    formatCode: 0
  }
];
messageObj = {
  type: 'T',
  objLength: 50,
  data: new Buffer(
    [
      0, 0x02, // # of fields
      0x66, 0x6f, 0x6f, 0, // 'foo\0' field name
      0, 0, 0, 0x01, // objectID of parent table
      0, 0x00, // attribute number (0-based)
      0, 0, 0, 0x02, // objectID of data type
      0, 0x03, // data type size
      0, 0, 0, 0x04, // type modifier
      0, 0x00, // format code
      0x62, 0x61, 0x72, 0, // 'bar\0'
      0, 0, 0, 0x11, // objectID of parent table
      0, 0x01, // attribute number (0-based)
      0, 0, 0, 0x12, // objectID of data type
      0, 0x13, // data type size
      0, 0, 0, 0x14, // type modifier
      0, 0x00 // format code
    ]
  )
};
assert.deepEqual(messageParser.parseMessage(messageObj), expected);

