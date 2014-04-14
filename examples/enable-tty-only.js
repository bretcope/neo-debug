"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

/*
There may be instances when we only want to output in TTY mode. We can do that by disabling plain-text output 
 */
var tty = neoDebug('examples:tty-only', { plain: false });
tty('this will only show up in TTY mode');

/*
The opposite effect can be achieved by disabling TTY, which will cause the output to only happen when in plain-text mode.
 */
var plain = neoDebug('examples:plain-only', { tty: false });
plain('this will only show up in plain-text mode');
