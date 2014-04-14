"use strict";

process.env.DEBUG = 'benchmark:*';

var neo = require('../lib/neo-debug')('benchmark:neo');
var neoNoop = require('../lib/neo-debug')('noop:neo');

var debug = require('debug')('benchmark:debug');
var debugNoop = require('debug')('noop:debug');

var sample = 'this is a sample output';

var outputs = [];
outputs.push(runBenchmark(neoNoop, 'neo-d (noop)', 100000));
outputs.push(runBenchmark(debugNoop, 'debug (noop)', 100000));
outputs.push(runBenchmark(neo, 'neo-d (output)', 10000));
outputs.push(runBenchmark(debug, 'debug (output)', 10000));

for (var i in outputs)
{
	var o = outputs[i];
	console.log('%s performed %s operations in %s seconds (%s ops/sec)', o.name, commas(o.ops), o.duration.toFixed(4), commas(o.ops / o.duration));
}

function runBenchmark (log, name, ops)
{
	var start = process.hrtime();
	for (var i = 0; i < ops; i++)
		log(sample);
	
	var end = process.hrtime(start);
	var seconds = end[0] + end[1] / 1e9;
	
	return {
		name: name,
		ops: ops,
		duration: seconds
	};
}

function commas (number)
{
	var str = String(Math.round(number));
	while (str.length % 3 !== 0)
		str = ' ' + str;
	
	var output = '';
	for (var i = 0; i < str.length; i += 3)
	{
		output += str.substr(i, 3);
		if (i + 3 < str.length)
			output += ',';
	}
	
	return output.trim();
}
