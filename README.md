# postgresql-node

A pure Javascript implementation of PostgreSQL's network protocol.

http://www.postgresql.org/docs/9.2/interactive/protocol.html

## Example:

At this point, passwords are not supported (maybe in v 0.1.0)
You will need to edit listener.js to put in your username/database in the options object.
For the default install of PostgreSQL on Mac OS X, no password is set by default, so you should be able to just change the username.
listener.js creates a listener on port 55432 (

node lib/listener.js
(in another window):
node lib/client.js (this sends a query to the server)

## Current Features

Parsing of some of PostgreSQL's backend messages:
* AuthenticationOk
* BackendKeyData
* CommandComplete
* DataRow
* ReadyForData
* RowDescription

Simple 'query' fu

Event-based; simply listen for the event with a name corresponding to the documented PostgreSQL backend message.
The names of the events are camelCased (first letter lowercase), but otherwise should be the same as the PG backend message.

## Target Features

* Low-level API implementing the entire protocol
* Mid-level API wrapping some of the message calls to allow easy queries

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
