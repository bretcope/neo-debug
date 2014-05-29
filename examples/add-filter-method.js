"use strict";

process.env.DEBUG = 'examples:one';
var neoDebug = require('../lib/neo-debug');
var debug1 = neoDebug('examples:one');
var debug2 = neoDebug('examples:two');

debug1('one');
debug2('two');

neoDebug.addFilter('examples:two');

debug1('one');
debug2('two');

console.log(neoDebug.getFilters());

neoDebug.removeFilter('examples:one');

debug1('one');
debug2('two');

console.log(neoDebug.getFilters());
