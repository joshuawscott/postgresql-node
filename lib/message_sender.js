/*jslint browser: false, node: true, indent: 2 */
"use strict";

/*function Message() {
  console.log("new Message()");
}
var message = new Message();*/
// Data Types for PG:
// Big-Endian data throughout.
// Int<n>(i) - n = bits; i = exact value
// Int<n>[k] - Array of n-bit integers, length k
// String(s) - c-style string (NUL terminated); s = exact value
// Byte<n>(c) - n = number of bytes; c = exact value

// All Messages:
// First Byte of the message is the message type. EXCEPTIONS:
//    StartupMessage
//    CancelRequest
//    SSLRequest
// Exceptions have the length first, then a hard-coded message.


// Frontend Message Types:
// B = Frontend => Bind
// C = Frontend => Close command
// c = Frontend => COPY-complete
// D = Frontend => Describe
// d = Frontend => COPY data
// E = Frontend => Execute
// F = Frontend => Function Call
// f = Frontend => COPY-failure
// H = Frontend => Flush
// P = Frontend => Parse
// p = Frontend => Password response
// Q = Frontend => Simple Query
// The second 4 bytes give the message length in bytes, type Int32; This is the entire message length.
// NOTE: the initial message type character isn't included in the length.
// There are exceptions as noted above.

// Frontend Messages

// Bind (F)
// Byte1('B')
// Int32 - Length
// String - name of the destination portal - blank selects the unnamed portal
// String - name of the source prepared statement - blank selects the unnamed prepared statement
// Int16 - number of parameter format codes that follow.  One of:
//    (0 => no parameters, or parameters all use the default format (text))
//    (1 => the specified format code applies to all parameters)
//    ([number of parameters] => parameters each have a specified format
// Int16[c] - 0 => text format; 1 => binary format.
// Int16 - the number of parameter values that follow; must match the number of parameters needed by the query
// Any number of the following pairs (well, the number given in the previous Int16):
// Int32 - length of the next value
// Byte<n> - value of the parameter, in the format indicated by the associated format code. n is the previous Int32.
// Int16 - The number of result-column format codes that follow.
// Int16[R] the result-column format codes; R => the previous Int16.
//exports.bind = function(options) {
//  defaultOptions = {
//    destinationPortal: '',
//    sourcePreparedStatement: '',
//    parameterFormatCodes: [0],
//    parameterValues: [],
//    resultColumnFormatCodes: [0]
//  };
//  if (options !== object) {
//    options = defaultOptions;
//  }
//
//  var messageString = 'B',
//    messageLength,
//    destinationPortal = options.destinationPortal + '\u0000',
//    sourcePreparedStatement = options.sourcePreparedStatement + '\u0000',
//    parameterFormatCodesNumber = options.parameterFormatCodes.parameters.length,
//    parameterFormatCodes = options.parameterFormatCodes,
//    parameterValuesNumber = options.parameterValues.length,
//    parameterValues = options.parameterValues,
//    resultColumnFormatCodes = options.resultColumnFormatCodes;
//
//};

// CancelRequest (F)
// Int32(16)
// Int32(80877102)
// Int32 - process ID
// Int32 - secret key
exports.cancelRequest = function(processID, secretKey) {
  var buf = new Buffer(16);
  buf.writeInt32(16, 0);
  buf.writeInt32(80877102, 4);
  buf.writeInt32(processID, 8);
  buf.writeInt32(secretKey, 12);
  return buf;
};

// Close (F)
// Byte1('C')
// Int32 - Length
// Byte1 - 's' => close prepared statement; 'P' => close a portal
// String - name of the prepared_statement or portal to close.  '' => selects the unnamed prepared statement or portal
exports.close = function(type, name) {
  var messageLength = 4, // length octets
    buf = new Buffer(messageLength + 1);
  buf.write('C', 0);
  buf.writeInt32(messageLength, 4);
  buf.write(type, 8);
  buf.write(name + '\u0000', 9);
  return buf;

};

// CopyData (F & B)
// Byte1('d')
// Int32 - Length
// Byte<n> - COPY data stream; arbitrary data chunks

// CopyDone (F & B)
// Byte1('c')
// Int32(4)
exports.flush = function () {
  var buf = new Buffer(5);
  buf.write('c');
  buf.writeInt32BE(4, 1);
  return buf;
};

// CopyFail (F)
// Byte1('f')
// Int32 - Length
// String - error message

// Describe (F)
// Byte1('D')
// Int32 - Length
// Byte1 - 'S' => prepared statement, 'P' => portal
// String - name of the prepared statement or portal to describe.  blank selects unnamed statement or portal.

// Execute (F)
// Byte1('E')
// Int32 - Length
// String - name of the portal to execute. blank selects the unnamed portal
// Int32 - maximum rows to return.  0 => no limit

// Flush (F)
// Byte1('H')
// Int32(4)
exports.flush = function () {
  var buf = new Buffer(5);
  buf.write('H');
  buf.writeInt32BE(4, 1);
  return buf;
};

// FunctionCall (F)
// Byte1('F')
// Int32 - Length
// Int32 - object ID of the function to call
// Int16 - number of argument format codes; C below
// Int16[C] - argument format codes; 0 => text, 1 => binary
// Int16 - arguments to the function
// 'C' Pairs of fields:
// Int32 - length of the argument value (n)
// Byte[n]
// After all the pairs:
// Int16 - format code for the function result.  0 => text, 1 => binary

// Parse (F)
// Byte1('P')
// Int32 - Length
// String - name of the destination prepared statement
// String - Query string to be parsed
// Int16 - The number of parameter data types (0+)
// For each parameter:
// Int32 - Object ID of the parameter type. 0 means unspecified.

// PasswordMessage (F)
// Byte1('p')
// Int32 - Length
// String - password (encrypted or plaintext, depending on Backend request)
exports.passwordMessage = function (password, encrypted) {

  var messageLength = 4,
    buf;
  encrypted = (encrypted === undefined) ? false : encrypted;
  if (encrypted === true) {
    throw "Password Encryption not implemented";
  }
  messageLength += Buffer.byteLength(password);

  buf = new Buffer(messageLength);
  buf.write('p');
  buf.writeInt32BE(messageLength - 1, 1);
  buf.write(password, 5);

  return buf;
};

// Query (F)
// Byte1('Q')
// Int32 - Length
// String - Query String
exports.query = function (queryString) {
  queryString = queryString + '\u0000';
  var messageLength = Buffer.byteLength(queryString) + 5,
    buf = new Buffer(messageLength);
  buf.write('Q');
  buf.writeInt32BE(messageLength - 1, 1);
  buf.write(queryString, 5);
  return buf;
};

// SSLRequest (F)
// Int32(8)
// Int32(80877103)
exports.sslRequest = function () {
  var buf = new Buffer(8);
  buf.writeInt32BE(8);
  buf.writeInt32BE(80877103, 4);
  return buf;
};

// StartupMessage (F)
// Int32 - length of message
// Int32(196608) - protocol version number
// String - 'user'
// String - username
// String - 'database' [optional]
// String - database name [optional]
// String - 'options' [optional, deprecated]
// String - command-line options for backend [optional, deprecated]
// Any Number of the following:
// String - any run-time option name [optional]
// String - any run-time option value [optional]
// Returns a Buffer containing the StartupMessage
// username = username to connect as
// database = database to connect to (default => username)
// options = object containing other options (optional)
exports.startupMessage = function (username, database, options) {

  var term_char = "\u0000",
    messageLength = 0,
    protocolVersion = 196608, // hard-coded protocol version 0x0300
    messageString = '',
    i,
    buf;

  messageString += "user" + term_char + username + term_char;
  messageString += "database" + term_char;
  messageString += (database === undefined) ? username : database;
  messageString += term_char;

  // various other options string
  for (i in options) {
    if (options.hasOwnProperty(i)) {
      //console.log(i);
      messageString += i + term_char;
      messageString += options[i] + term_char;
    }
  }

  messageString += term_char; // Undocumented final termination character needed!
  messageLength = Buffer.byteLength(messageString);

  // Create Buffer
  buf = new Buffer(messageLength + 8); // Add 8 bytes for length & protocol
  buf.writeInt32BE(messageLength + 8, 0);
  buf.writeInt32BE(protocolVersion, 4);
  buf.write(messageString, 8, messageLength, 'utf8');
  return buf;
};

// Sync (F)
// Byte1('S')
// Int32(4)
exports.sync = function () {
  var buf = new Buffer();
  buf.write('S');
  buf.writeInt32BE(4);
  return buf;
};

// Misc. functions to do behind-the-scenes work

// Accepts Array of Objects like:
// [{type: 'value'},...]
// type must be one of byte, string, int16, int32.
// Returns a Buffer object after processing.
var createMessageBuffer = function (arr) {
  if (arguments.length !== 1) {
    throw 'Must have exactly 1 argument.';
  }
  if (arr.length === 0) {
    console.log("Array can't be empty");
    return new Buffer(0);
  }
  console.log(arguments.length);
  console.log(arr.length);

  var type,
    val,
    bufferLength = 0,
    i,
    messageBuffer,
    offset;
  for (i = 0; i < arr.length; i += 1) {
    type = Object.keys(arr[i])[0].toLowerCase();
    val = arr[i][type];
    if (type === 'string') {
      if (typeof val !== 'string') {
        throw 'Type mismatch, expected string as "string", got ' + typeof val;
      }
      bufferLength += Buffer.byteLength(val) + 1;

    } else if (type === 'int32') {
      if (typeof val !== 'number') {
        throw 'Type mismatch, expected int32 as "number", got ' + typeof val;
      }
      bufferLength += 4;

    } else if (type === 'int16') {
      if (typeof val !== 'number') {
        throw 'Type mismatch, expected int16 as "number", got ' + typeof val;
      }
      bufferLength += 2;

    } else if (type === 'byte') {
      if (typeof val !== 'string') {
        throw 'Type mismatch, expected byte as "string", got ' + typeof val;
      }
      bufferLength += 1;

    } else {
      throw 'type must be byte, string, int32, or int16';
    }
  }
  console.log(bufferLength.toString()); //DEBUG

  messageBuffer = new Buffer(bufferLength);
  offset = 0;
  for (i = 0; i < arr.length; i += 1) {
    type = Object.keys(arr[i])[0].toLowerCase();
    val = arr[i][type];
    if (type === 'string') {
      console.log(typeof val); //DEBUG
      messageBuffer.write(val + '\u0000', offset);
      offset += Buffer.byteLength(val) + 1;
    } else if (type === 'int32') {
      console.log(typeof val); //DEBUG
      messageBuffer.writeInt32BE(val, offset);
      offset += 4;
    } else if (type === 'int16') {
      console.log(typeof val); //DEBUG
      messageBuffer.writeInt16BE(val);
      offset += 2;
    } else if (type === 'byte') {
      console.log(typeof val); //DEBUG
      messageBuffer.write(val);
      offset += 1;
    }
  }

  return messageBuffer;
};
//createMessageBuffer([{byte: 'A'}, {string: 'hi, me!'}, {int32: 20}]);

exports.createMessageBuffer = createMessageBuffer;