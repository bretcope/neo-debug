"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

var enable = neoDebug('force-example');
enable('this will not output');
enable.update({ enable: true });
enable('this will output');

var disable = neoDebug('examples:disable');
disable('before disabling');
disable.update({ enable: false });
disable('after disabling');

/*
  force-example this will output
  examples:disable before disabling
 */
