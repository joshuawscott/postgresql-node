/*jslint browser: false, node: true, indent: 2 */
"use strict";

var pgConn = require('./postgresql_connection');
var net = require('net');

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
  response.rowDescription = message;
});
connection.on('dataRow', function (message) {
  response.dataRows.push(message.dataRows.shift());
});
connection.on('commandComplete', function (message) {
  var jsonResponse = {};
  jsonResponse.dataRows = response.dataRows;
  jsonResponse.rowDescription = response.rowDescription.rowDescription;
  queryListener.write(JSON.stringify(jsonResponse));
});

// Listener to wait for incoming JSON requests and query the DB.
// Send a JSON object like:
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
    socket.write(data);
  };
  console.log('client connected');
  socket.on('data', function (data) {
    queryQueue.push(JSON.parse(data));
    processQueryQueue();
  });
  socket.on('end', function () { console.log("client disconnected"); });
  socket.write("Accepting JSON queries\n");
});

queryListener.listen(55432, function () {
  console.log("Listening on 55432");
});

function sendResponse(response) { queryListener.write(response); }
function processResponseQueue() {
  if (responseQueue.length > 0) {
    sendResponse(responseQueue.shift());
  }
}
// Send the response when ready:
connection.on('commandComplete', processResponseQueue);
