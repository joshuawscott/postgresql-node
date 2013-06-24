# postgresql-node

A pure Javascript implementation of PostgreSQL's network protocol.

http://www.postgresql.org/docs/9.2/interactive/protocol.html

## Example:

You will need to edit listener.js to put in your username/database in the options object.
For the default install of PostgreSQL on Mac OS X, no password is set by default, so you should be able to just change the username.

listener.js creates a listener on port 55432.

`node lib/listener.js`

(in another window): `node lib/client.js` (this sends a query to the server)

## Rolling your own:

    var PG = require('./lib/postgresql_connection');
    options = {hostname: localhost, username: pguser, port: 5432, database: pguser};
    pgConnection = PG.connect(options);
    pgConnection.on('connect', function () {
      pgConnection.authenticate();
    });
    pgConnection.on('readyForQuery', function () {
      pgConnection.query("SELECT NOW() AS current_time");
    });

See [the Wiki](https://github.com/joshuawscott/postgresql-node/wiki/PostgresqlConnection "PostgresqlConnection") for more.

## Current Features

### High-level protocol
listener.js implements the low-level protocol of postgresql_connection.js to give a higher-level protocol.
You can send bare JSON over the network while listener.js is running, and

### Low-level protocol
Currently postgresql_connection.js implements the some of PostgreSQL's backend messages:
* AuthenticationOk
* BackendKeyData
* CommandComplete
* DataRow
* ReadyForData
* RowDescription

In addtion, it has .query(query) and .authenticate()
The low-level protocol is event-based; simply listen for the event with a name corresponding to the documented PostgreSQL backend message.

The names of the events are camelCased (first letter lowercase), but otherwise should be the same as the PG backend message.

## Target Features

As of 0.0.1, passwords are not implemented.

* Low-level API implementing the entire protocol

## License

Copyright &copy; 2013 Joshua Scott

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
