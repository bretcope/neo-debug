"use strict";
/* -------------------------------------------------------------------
 * Require Statements << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

var Util = require('util');

/* =============================================================================
 * 
 * neo-debug module
 *  
 * ========================================================================== */

module.exports = neoDebug;

/* -------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------- */

 // thanks to the "colors" module https://github.com/Marak/colors.js/blob/master/colors.js
var COLORS =
{
	none: null,
	white: ['\x1B[37m', '\x1B[39m'],
	grey: ['\x1B[90m', '\x1B[39m'],
	black: ['\x1B[30m', '\x1B[39m'],
	red: ['\x1B[31m', '\x1B[39m'],
	green: ['\x1B[32m', '\x1B[39m'],
	yellow: ['\x1B[33m', '\x1B[39m'],
	blue: ['\x1B[34m', '\x1B[39m'],
	magenta: ['\x1B[35m', '\x1B[39m'],
	cyan: ['\x1B[36m', '\x1B[39m']
};

var BACKGROUNDS =
{
	none: null,
	white: ['\x1B[47m', '\x1B[49m'],
	grey: ['\x1B[49;5;8m', '\x1B[49m'],
	black: ['\x1B[40m', '\x1B[49m'],
	red: ['\x1B[41m', '\x1B[49m'],
	green: ['\x1B[42m', '\x1B[49m'],
	yellow: ['\x1B[43m', '\x1B[49m'],
	blue: ['\x1B[44m', '\x1B[49m'],
	magenta: ['\x1B[45m', '\x1B[49m'],
	cyan: ['\x1B[46m', '\x1B[49m']
};

var STYLES =
{
	bold: ['\x1B[1m', '\x1B[22m'],
	italic: ['\x1B[3m', '\x1B[23m'],
	underline: ['\x1B[4m', '\x1B[24m'],
	inverse: ['\x1B[7m', '\x1B[27m'],
	strikethrough: ['\x1B[9m', '\x1B[29m']
};

var SEC = 1000;
var MIN = 60 * 1000;
var HOUR = 60 * MIN;

/* -------------------------------------------------------------------
 * Private Members Declaration << no methods >>
 * ---------------------------------------------------------------- */

var _globalOptions =
{
	background: 'none',
	colors: ['red', 'blue', 'green', 'magenta', 'cyan', 'grey'],
	colorWholeLine: false,
	fd: process.stdout,
	filter: '',
	time: { tty: 'diff', plain: 'iso' }
};

var _nextAutoColor = 0;

var _includes = [];
var _includesPatterns = [];
var _excludes = [];
var _excludesPatterns = [];

var _functions = {};
var _options = [];
var _prevTimes = [];

/* -------------------------------------------------------------------
 * Public Members Declaration << no methods >>
 * ---------------------------------------------------------------- */

Object.defineProperties(neoDebug,
{
	background:
	{
		get: function () { return _globalOptions.background; },
		set: function (background)
		{
			_globalOptions.background = background;
			updateAll();
		}
	},
	colors:
	{
		get: function () { return _globalOptions.colors; },
		set: function (colors)
		{
			_globalOptions.colors = colors;
			updateAll();
		}
	},
	colorWholeLine:
	{
		get: function () { return _globalOptions.colorWholeLine; },
		set: function (colorWholeLine)
		{
			_globalOptions.colorWholeLine = colorWholeLine;
			updateAll();
		}
	},
	fd:
	{
		get: function () { return _globalOptions.fd; },
		set: function (fd)
		{
			_globalOptions.fd = fd;
			updateAll();
		}
	},
	filter:
	{
		get: function () { return _globalOptions.filter; },
		set: function (filter)
		{
			_excludes = [];
			_excludesPatterns = [];
			_includes = [];
			_includesPatterns = [];
			var names = filter.split(/[\s,]+/);
			var n;
			for (var i = 0; i < names.length; i++)
			{
				n = names[i];
				if (n[0] === '-')
				{
					neoDebug.addFilter(n.substr(1), true, true);
				}
				else
				{
					neoDebug.addFilter(n, false, true);
				}
			}
			
			updateAll();
		}
	},
	time:
	{
		get: function () { return _globalOptions.time; },
		set: function (time)
		{
			if (time)
			{
				var validTimes = /^iso|diff|none$/;
				if (typeof time === 'string' && validTimes.test(time))
				{
					_globalOptions.time.tty = _globalOptions.time.plain = time;
				}
				else
				{
					if (validTimes.test(time.tty))
						_globalOptions.time.tty = time.tty;
					
					if (validTimes.test(time.plain))
						_globalOptions.time.plain = time.plain;
				}
				
				updateAll();
			}
		}
	}
});

/* -------------------------------------------------------------------
 * Public Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

function neoDebug (prefix, options)
{
	var copy = {};
	if (options)
	{
		for (var i in options)
			copy[i] = options[i];
	}

	copy.prefix = prefix;

	var index = String(_options.push(copy) - 1);
	_prevTimes.push(0);
	updateDebugFunction(index);
	function debug ()
	{
		var f = _functions[index];
		if (f !== disabled)
			f(arguments);
	}

	debug.update = function (options)
	{
		if (!options)
			return;

		var orig = _options[index];
		for (var i in options)
			orig[i] = options[i];

		updateDebugFunction(index);
	};

	return debug;
}

/* -------------------------------------------------------------------
 * Public Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

neoDebug.addFilter = function (pattern, toExcludes, dontUpdate)
{
	if (neoDebug.hasFilter(pattern, toExcludes))
		return;

	var reg = new RegExp('^' + pattern.replace('*', '.*?') + '$');
	if (toExcludes)
	{
		_excludesPatterns.push(pattern);
		_excludes.push(reg);
	}
	else
	{
		_includesPatterns.push(pattern);
		_includes.push(reg);
	}
	
	if (!dontUpdate)
		updateAll();
};

neoDebug.getFilters = function ()
{
	return {
		includes: _includesPatterns.slice(),
		excludes: _excludesPatterns.slice()
	};
};

neoDebug.hasFilter = function (pattern, inExcludes)
{
	var p = inExcludes ? _excludesPatterns : _includesPatterns;
	for (var i = 0; i < p.length; i++)
	{
		if (p[i] === pattern)
			return true;
	}

	return false;
};

neoDebug.removeFilter = function (pattern, fromExcludes)
{
	var p = fromExcludes ? _excludesPatterns : _includesPatterns;
	var r = fromExcludes ? _excludes : _includes;
	for (var i = 0; i < p.length; i--)
	{
		if (p[i] === pattern)
		{
			r.splice(i, 1);
			p.splice(i, 1);

			updateAll();
			return true;
		}
	}

	return false;
};
 
/* -------------------------------------------------------------------
 * Private Methods << Keep in alphabetical order >>
 * ---------------------------------------------------------------- */

function disabled () {}

function filterCheck (prefix)
{
	var i;
	for (i in _excludes)
	{
		if (_excludes[i].test(prefix))
			return false;
	}
	
	for (i in _includes)
	{
		if (_includes[i].test(prefix))
			return true;
	}
	
	return false;
}

// stolen from the debug module "humanize" function - https://github.com/visionmedia/debug/blob/master/lib/debug.js
function humanize (ms)
{
	if (ms >= HOUR)
		return (ms / HOUR).toFixed(1) + 'h';
	
	if (ms >= MIN)
		return (ms / MIN).toFixed(1) + 'm';
	
	if (ms >= SEC) 
		return (ms / SEC | 0) + 's';
	
	return ms + 'ms';
}

function updateAll ()
{
	for (var i in _functions)
		updateDebugFunction(i);
}

function updateDebugFunction (index)
{
	var options = _options[index];

	// select output stream
	var fd = options.fd || _globalOptions.fd;
	if (fd === 'stderr')
		fd = process.stderr;
	else if (fd === 'stdout')
		fd = process.stdout;
	
	if (!fd || typeof fd.write !== 'function')
		fd = process.stdout;

	// check whether this prefix should be enabled
	if (options.enable === false || 
		(options.enable !== true && !filterCheck(options.prefix)) ||
		(fd.isTTY && options.tty === false) ||
		(!fd.isTTY && options.plain === false))
	{
		_functions[index] = disabled;
		return;
	}

	//select time format
	var time;
	if (options.time)
	{
		if (options.time && typeof options.time === 'object')
			time = fd.isTTY ? options.time.tty : options.time.plain;
		else
			time = options.time;
	}

	switch (time)
	{
		case 'iso':
		case 'diff':
		case 'utc':
		case 'none':
			break;
		default:
			time = fd.isTTY ? _globalOptions.time.tty : _globalOptions.time.plain;
			break;
	}

	var prefix = options.prefix + ' ';
	
	var color, background, wholeLine;
	var left = '';
	var right = '';
	var pad = '';
	if (fd.isTTY)
	{
		pad = '  ';
		
		// select color
		if (!options.color || !COLORS[options.color])
		{
			if (_nextAutoColor >= _globalOptions.colors.length)
				_nextAutoColor = 0;
			
			options.color = _globalOptions.colors[_nextAutoColor];
			_nextAutoColor++;
		}
		
		color = COLORS[options.color];
		
		// select background color
		var backName = options.background || _globalOptions.background;
		if (BACKGROUNDS[backName])
			background = BACKGROUNDS[backName];
		
		wholeLine = 'colorWholeLine' in options ? options.colorWholeLine : _globalOptions.colorWholeLine;
		
		if (color)
		{
			left = color[0];
			right = color[1];
		}
		
		if (background)
		{
			left = background[0] + left;
			right += background[1];
		}
		
		// make prefix bold
		prefix = STYLES.bold[0] + prefix + STYLES.bold[1];
		if (!wholeLine)
			prefix = left + prefix + right;
	}
	
	function log (args)
	{
		var now = Date.now();
		var prev = _prevTimes[index];
		_prevTimes[index] = now;
		
		var str = prefix + Util.format.apply(null, Array.prototype.slice.call(args));
		
		if (time === 'iso')
		{
			str = new Date(now).toISOString() + ' ' + str;
		}
		else if (time === 'diff' && prev !== 0)
		{
			var suffix = ' +' + humanize(now - prev);
			if (!wholeLine)
				suffix = left + suffix + right;
			
			str += suffix;
		}
		else if (time === 'utc')
		{
			str = new Date(now).toUTCString() + ' ' + str;
		}
		
		if (wholeLine)
			str = left + str + right;
		
		fd.write(pad + str + '\n');
	}

	_functions[index] = log;
}

/* -------------------------------------------------------------------
 * Initialization
 * ---------------------------------------------------------------- */

neoDebug.filter = process.env.DEBUG || '';
