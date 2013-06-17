/*jslint browser: false, node: true, indent: 2 */
"use strict";
var generator = require('./message_sender'),
  parser = require('./message_parser'),
  net = require('net'),
  events = require('events'),
  util = require('util');


function PostgresqlConnection(opts) {
  if (!(this instanceof PostgresqlConnection)) {
    return new PostgresqlConnection(arguments);
  }

  events.EventEmitter.call(this);

  var self = this;
  self.messageQueue = [];
  self.username = opts.username;
  self.password = opts.password;
  self.hostname = opts.hostname;
  self.port     = opts.port;
  self.database = opts.database;
  var _connectionParameters = {};
  self.connectionParameters = function () { return _connectionParameters };
  self.connection = net.connect(opts.port, opts.hostname, function () {
    console.log("connected on TCP");
    bindDataListener();
    self.emit('connect');
  });

  function bindDataListener() {
    console.log("bindDataListener()");
    self.connection.on('data', function (data) {
      console.log("Received Data:")
      console.log(data);
      var messages = parser.Parse(data),
        parsedData,
        i;
      for (i=0;i<messages.length;i++) {
        parsedData = parser.parseMessage(messages[i]);
        console.log('Emit: ' + parsedData.eventName); //DEBUG
        self.emit(parsedData.eventName, parsedData);
      }
    });
  }

  self.query = function (string) {
    console.log("query()");
    var buf_to_send = generator.query(string);
    self.connection.write(buf_to_send);
    console.log("sent buffer:");
    console.log(buf_to_send);
  };

  self.authenticate = function () {
    console.log("authenticate()");
    self.connection.write(generator.startupMessage(self.username, self.database));
  };

  self.on('connect', function () {
    console.log('Event: connect');
  });

  self.on('newListener', function (event, listener) {
    console.log("newListener! Event: " + event);
  });

  self.on('parameterStatus', function (messageObj) {
    console.log(messageObj);
    _connectionParameters[messageObj.parameterKey] = messageObj.parameterValue;
  });

  self.wakeUp = function wakeUp() {
    self.emit('readyForQuery');
  }
}
util.inherits(PostgresqlConnection, events.EventEmitter);

// Use connect to create a new PostgreSQL connection.  This will ensure defaults
// are set, and pass the proper options to the initializer.
exports.connect = function connect(options) {
  console.log("PostgresqlConnection.connect("+options+")");
  if (typeof options === 'string') {
    options = parseConnectString(options);
  }
  var processUsername = findUserName();
  var defaultOptions = {
    hostname: 'localhost',
    username: processUsername,
    database: processUsername,
    port:     5432
  };
  for (var option in defaultOptions) {
    if (options.hasOwnProperty(option) && options[option] === undefined) {
      options[option] = defaultOptions[option];
    }
  }
  options.hostname = options.hostname === undefined ? 'localhost' : options.hostname;

  return new PostgresqlConnection(options);
};

// Finds the username of the current process.
function findUserName() {
  var thisENV = process.env,
    possibleVariables = ['USER', 'USERNAME'];
  for (var i=0;i<possibleVariables.length;i++) {
    if (possibleVariables[i]) return process.env[possibleVariables[i]];
  }
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
  if (arr.length == 2) {
    options.comm = arr[0];
    string = arr[1];
  } else if (arr.length == 1) {
    string = arr[0];
  } else {
    throw new SyntaxError;
  }

  arr = string.split('/');
  if (arr.length == 2) { // has database
    options.database = arr[1]
  } else if (arr.length == 1) {
    // no database
  } else {
    throw new SyntaxError;
  }
  string = arr[0];

  arr = string.split('@');
  if (arr.length == 2) { // login & destination

    login = arr[0].split(':');
    destination = arr[1].split(':');

    options.username = login[0];
    if (login.length == 2) {
      options.password = login[1];
    }

    options.hostname = destination[0];
    if (destination.length == 2) {
      options.port = 0 + destination[1];
    }

  } else if (arr.length == 1) { // only destination
    destination = arr[0].split(':');

    options.hostname = destination[0];
    if (destination.length == 2) {
      options.port = destination[1];
    }

  } else {
    throw new SyntaxError;
  }
  return options;
};
exports._parseConnectString = parseConnectString;