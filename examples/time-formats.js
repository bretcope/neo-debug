"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

var diff = neoDebug('examples:diff', { time: 'diff' });
var utc = neoDebug('examples:utc', { time: 'utc' });
var iso = neoDebug('examples:iso', { time: 'iso' });
var none = neoDebug('examples:none', { time: 'none' });

diff('one');
diff('two');
utc('one');
utc('two');
iso('one');
iso('two');
none('one');
none('two');

/*
examples:diff one
examples:diff two +2ms
Mon, 14 Apr 2014 06:14:01 GMT examples:utc one
Mon, 14 Apr 2014 06:14:01 GMT examples:utc two
2014-04-14T06:14:01.943Z examples:iso one
2014-04-14T06:14:01.944Z examples:iso two
examples:none one
examples:none two
 */
