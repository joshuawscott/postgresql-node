"use strict";
var net = require('net');

var query = "SELECT NOW() AS current_time";
//var query = "SELECT geonameid, name, admin4_code FROM geonames.geoname ORDER BY geonameid ASC LIMIT 1";
//var query = "INSERT INTO mytable VALUES ('pg-node', 'program')";

function sendQuery() {
  client.write(JSON.stringify({query: query}));
}

var client = net.connect({port: 55432}, sendQuery);

client.on('data', function (data) {
  console.log(data.toString());
  //client.end();
});