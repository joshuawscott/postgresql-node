/*jslint browser: false, node: true, indent: 2 */
"use strict";
var generator = require('./message_sender'),
  parser = require('./message_parser'),
  net = require('net'),
  events = require('events'),
  util = require('util');

// Not for direct use; call connect(options) to construct.
function PostgresqlConnection(opts) {
  if (!(this instanceof PostgresqlConnection)) {
    return new PostgresqlConnection(arguments);
  }

  events.EventEmitter.call(this);

  var self = this,
    readyForQuery = false,
    connectionParameters = {},
    dataBuffer = new Buffer(0);
  //self.messageQueue = [];
  self.username = opts.username;
  self.password = opts.password;
  self.hostname = opts.hostname;
  self.port     = opts.port;
  self.database = opts.database;
  self.readyForQuery = function () {
    return readyForQuery;
  };
  self.connectionParameters = function () { return connectionParameters; };
  function bufferData(data) {
    dataBuffer = Buffer.concat([dataBuffer, data]);
  }
  function parseDataBuffer() {
    // parser.Parse takes a raw data buffer and splits it into messages.
    var messages,
      i,
      parsedData;
    messages = parser.Parse(dataBuffer);
    if (messages.partialMessage === null) {
      dataBuffer = null;
      dataBuffer = new Buffer(0);
    } else {
      dataBuffer = null;
      dataBuffer = new Buffer(messages.partialMessage.length);
      dataBuffer = messages.partialMessage;
    }
    for (i = 0; i < messages.messages.length; i += 1) {
      // parser.parseMessage parses a single message
      parsedData = parser.parseMessage(messages.messages[i]);
      console.log(parsedData.eventName);
      self.emit(parsedData.eventName, parsedData);
    }
  }
  function bindDataListener() {
    //setInterval(parseDataBuffer, 1000);

    self.connection.on('readable', function () {
      var data;
      /*ignore jslint start*/
      while (null !== (data = self.connection.read())) {
        bufferData(data);
        data = null;
      }
      /*ignore jslint stop*/
      parseDataBuffer();
    });

  }

  self.connection = net.connect(opts.port, opts.hostname, function () {
    bindDataListener();
    self.emit('connect');
  });

  self.query = function (string) {
    var buf_to_send = generator.query(string);
    self.connection.write(buf_to_send);
  };

  self.authenticate = function () {
    self.connection.write(generator.startupMessage(self.username, self.database));
  };
  self.on('connect', function () {
    console.log("connected to PostgreSQL on " + self.port);
  });
  self.on('parameterStatus', function (messageObj) {
    connectionParameters[messageObj.parameterKey] = messageObj.parameterValue;
  });

}
util.inherits(PostgresqlConnection, events.EventEmitter);


// Finds the username of the current process.
function findUserName() {
  var thisENV = process.env,
    possibleVariables = ['USER', 'USERNAME'],
    i;
  for (i = 0; i < possibleVariables.length; i += 1) {
    if (possibleVariables[i]) {
      return thisENV[possibleVariables[i]];
    }
  }
  return null;
}

// Creates an options Object out of one of the following:
// postgresql://hostname
// postgresql://hostname/database
// postgresql://username@hostname
// postgresql://username@hostname/database
// postgresql://hostname:5432
// postgresql://hostname:5432/database
// postgresql://username@hostname:5432
// postgresql://username@hostname:5432/database
// postgresql://username:password@hostname
// postgresql://username:password@hostname/database
// postgresql://username:password@hostname:5432
// postgresql://username:password@hostname:5432/database
var parseConnectString = function parseConnectString(string) {
  var options = {},
    arr = [],
    login,
    destination;

  arr = string.split('://');
  if (arr.length === 2) {
    options.comm = arr[0];
    string = arr[1];
  } else if (arr.length === 1) {
    string = arr[0];
  } else {
    throw new SyntaxError();
  }

  arr = string.split('/');
  if (arr.length === 2) { // has database
    options.database = arr[1];
  } else if (arr.length !== 1) {
    throw new SyntaxError();
  }
  string = arr[0];

  arr = string.split('@');
  if (arr.length === 2) { // login & destination

    login = arr[0].split(':');
    destination = arr[1].split(':');

    options.username = login[0];
    if (login.length === 2) {
      options.password = login[1];
    }

    options.hostname = destination[0];
    if (destination.length === 2) {
      options.port = destination[1];
    }

  } else if (arr.length === 1) { // only destination
    destination = arr[0].split(':');

    options.hostname = destination[0];
    if (destination.length === 2) {
      options.port = destination[1];
    }

  } else {
    throw new SyntaxError();
  }
  return options;
};
exports.parseConnectString = parseConnectString;

// Use connect to create a new PostgreSQL connection.  This will ensure defaults
// are set, and pass the proper options to the initializer.
exports.connect = function connect(options) {
  if (typeof options === 'string') {
    options = parseConnectString(options);
  }
  var processUsername = findUserName(),
    option,
    defaultOptions = {
      hostname: 'localhost',
      username: processUsername,
      database: processUsername,
      port:     5432
    };
  for (option in defaultOptions) {
    if (defaultOptions.hasOwnProperty(option) && options[option] === undefined) {
      options[option] = defaultOptions[option];
    }
  }
  options.hostname = options.hostname === undefined ? 'localhost' : options.hostname;

  return new PostgresqlConnection(options);
};
