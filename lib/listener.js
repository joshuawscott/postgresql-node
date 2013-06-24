/*jslint browser: false, node: true, indent: 2 */
"use strict";

var pgConn = require('./postgresql_connection');
var net = require('net');

// Change this
var options = {hostname: 'localhost', username: 'joshua', port: 5432, database: 'joshua'};

var connection = pgConn.connect(options);
var queryQueue = [];
var responseQueue = [];
var response = {dataRows: []};

// Listen for a connect event:
connection.on('connect', function () {
  connection.authenticate();
});

// Listen for authentication success:
function printSuccess() { console.log("Authentication Succeeded"); }
connection.on('authenticationOk', printSuccess);

connection.on('rowDescription', function (message) {
  response.rowDescription = message.rowDescription;
});
connection.on('dataRow', function (message) {
  response.dataRows.push(message.rowValue);
});

// Listener to wait for incoming JSON requests and query the DB.
// Expects a JSON object like:
// {"query":"SELECT * FROM table_name;"}
// Returns JSON with the response.
function sendQuery(query) { console.log("sendQuery"); connection.query(query); }

function processQueryQueue() {
  if (queryQueue.length > 0) {
    sendQuery(queryQueue.shift().query);
  }
}

// Send the next query when the server is ready:
connection.on('readyForQuery', processQueryQueue);

var queryListener = net.createServer(function (socket) {
  this.write = function write(data) {
    try {
      socket.write(data);
    } catch (err) {
      console.log("ERROR WRITING TO SOCKET: " + err + "\n");
      socket.end();
    }
  };
  console.log('client connected');
  socket.on('data', function (data) {
    var jsonData;
    try {
      jsonData = JSON.parse(data);
      queryQueue.push(JSON.parse(data));
      processQueryQueue();
    } catch (err) {
      socket.write("FATAL: " + err + "\n");
      socket.end();
    }
  });
  socket.on('end', function () { console.log("client disconnected"); });
  socket.write("Accepting JSON queries\n");
});

queryListener.listen(55432, function () {
  console.log("Listening on 55432");
});

function processResponseQueue() {
  if (responseQueue.length > 0) {
    queryListener.write(responseQueue.shift());
  }
}
// Send the response when ready:
connection.on('commandComplete', function (message) {
  var jsonResponse = {};
  jsonResponse.result = message.commandCompleteResult;
  jsonResponse.dataRows = response.dataRows;
  jsonResponse.rowDescription = response.rowDescription;
  jsonResponse.error = response.error;
  jsonResponse.notice = response.notice;
  queryListener.write(JSON.stringify(jsonResponse));
  response = {dataRows: []};
  processResponseQueue();
});

connection.on('errorResponse', function (errorMessage) {
  response.error = errorMessage.errorMessages.M;
});
connection.on('noticeResponse', function (noticeMessage) {
  response.notice = noticeMessage.noticeMessages.M;
});
