/*jslint browser: false, node: true, indent: 2 */

var pgConn = require('./postgresql_connection');
var net = require('net');

var options = {hostname: 'localhost', username: 'joshua', port: 5432, database: 'joshua'};
var connection = pgConn.connect(options);
var messageQueue = [];

function printSuccess() { console.log("Authentication Succeeded"); }
function sendQuery(query) { console.log("sendQuery"); connection.query(query); }

// Listen for a connect event:
connection.on('connect', function () {
  connection.authenticate();
});

// Listen for authentication success:
connection.on('authenticationOk', printSuccess);

// Listen for the readyForQuery message.
// This function unbinds the listener after sending the query.
connection.on('readyForQuery', function sendWhenReady(transactionStatus) {
  console.log("Ready For Query!");
  if (transactionStatus.dataString == 'I') {
    sendQuery("SELECT * from geonames.ca_postal_codes_with_timezones LIMIT 2;");
  }
  connection.removeListener('readyForQuery', sendWhenReady);
});

connection.on('readyForQuery', processQueue)

function processQueue() {
  if (messageQueue.length > 0) {
    sendQuery(messageQueue.shift().query);
  }
}

// Simple listener to wait for incoming JSON requests and query the DB:
var queryListener = net.createServer(function (socket) {
  console.log('client connected');
  socket.on('data', function(data) {
    messageQueue.push(JSON.parse(data));
    processQueue();
  });
  socket.on('end', function() {console.log("client disconnected")});
  socket.pipe(socket);
  socket.write("welcome\n");
});
queryListener.listen(55432, function(data) {
  console.log("Listening on 55432");
});