/*jslint browser: false, node: true, indent: 2 */
"use strict";

var pgConn = require('./postgresql_connection');
var net = require('net');

var options = {hostname: 'localhost', username: 'joshua', port: 5432, database: 'joshua'};
var connection = pgConn.connect(options);
var messageQueue = [];
var response = {};

// Listen for a connect event:
connection.on('connect', function () {
  connection.authenticate();
});

// Listen for authentication success:
function printSuccess() { console.log("Authentication Succeeded"); }
connection.on('authenticationOk', printSuccess);

// Simple listener to wait for incoming JSON requests and query the DB.
// Send a JSON object like:
// {"query":"SELECT * FROM table_name;"}
// Returns JSON with the response.
function sendQuery(query) { console.log("sendQuery"); connection.query(query); }

function processQueue() {
  if (messageQueue.length > 0) {
    sendQuery(messageQueue.shift().query);
  }
}

// Send the next query when the server is ready:
connection.on('readyForQuery', processQueue);


var queryListener = net.createServer(function (socket) {
  console.log('client connected');
  socket.on('data', function (data) {
    messageQueue.push(JSON.parse(data));
    processQueue();
  });
  socket.on('end', function () { console.log("client disconnected"); });
  socket.write("Accepting JSON queries\n");
});

queryListener.listen(55432, function () {
  console.log("Listening on 55432");
});