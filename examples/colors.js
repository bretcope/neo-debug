"use strict";

var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

var blue = neoDebug('examples:blue', { color: 'blue' });
var magenta = neoDebug('examples:magenta', { color: 'magenta', background: 'cyan' });
var greyBack = neoDebug('examples:grey-back', { background: 'grey' });
var wholeLine = neoDebug('examples:whole-line', { color: 'cyan', colorWholeLine: true });
var wholeLineBack = neoDebug('examples:whole-line-back', { color: 'cyan', background: 'yellow', colorWholeLine: true });

blue('sample output');
blue('sample output');
magenta('sample output');
magenta('sample output');
greyBack('sample output');
greyBack('sample output');
wholeLine('sample output');
wholeLine('sample output');
wholeLineBack('sample output');
wholeLineBack('sample output');
