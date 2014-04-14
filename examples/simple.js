"use strict";

process.env.DEBUG = 'examples:*';
var debug = require('../lib/neo-debug')('examples:simple');

debug('this is a simple example');
debug('of how to use neo-debug');
