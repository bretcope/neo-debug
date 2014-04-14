"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

/*
neo-debug writes to stdout by default. If we want to write to stderr instead, we can use the fd property
 */
var stderr = neoDebug('examples:stderr', { fd: 'stderr' });
stderr('this will output to stderr');

/*
If we want to output to something other than stdout or stderr, we can pass any object with a `write` function which accepts a single string argument.
Let's setup a mock stream class...
 */
function SimpleStream ()
{
	this.buffer = '';
}

SimpleStream.prototype.flush = function ()
{
	console.log('flushing buffer...');
	console.log(this.buffer);
	this.buffer = '';
};

SimpleStream.prototype.write = function (input) { this.buffer += input; };

/*
Now let's instantiate an object of our SimpleStream and use it instead of a file descriptor
 */
var stream = new SimpleStream();
var custom = neoDebug('examples:custom-output', { fd: stream });
custom('this will be written to the SimpleStream buffer');
stream.flush();

/*
Note that neo-debug writes to our stream in plain-text mode. If our stream object had the property `isTTY` set to `true`, neo-debug would write to it in TTY mode instead.
 */

/*
  examples:stderr this will output to stderr
flushing buffer...
2014-04-14T06:41:09.915Z examples:custom-output this will be written to the SimpleStream buffer
 */
