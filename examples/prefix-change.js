"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

var debug = neoDebug('examples:original');
debug('one');
debug.update({ prefix: 'examples:changed' });
debug('two');

/*
  examples:original one
  examples:changed two +1ms
 */
