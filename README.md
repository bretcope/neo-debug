# neo-debug

neo-debug is a configurable Node.js debug utility. Its intent is to be a more flexible version of the [visionmedia/debug](https://github.com/visionmedia/debug) module while maintaining much of the same simplicity, and a similar output format.

```
npm install neo-debug
```

Some notable features are:

1. Change the namespace/prefix filter at runtime.
2. Manually control the output colors.
3. Write to streams besides stdout.
4. Output time in different formats.

## Table of Contents

* [Examples](#examples)
    * [Simple](#examples-simple)
    * [Change Filter at Runtime](#examples-change-filter)
    * [Custom Output Stream](#examples-custom-output)
* [Reference](#reference)
    * [Options](#reference-options)
        * [background](#reference-options-background)
        * [color](#reference-options-color)
        * [colors](#reference-options-colors)
        * [colorWholeLine](#reference-options-colorwholeline)
        * [enable](#reference-options-enable)
        * [fd](#reference-options-fd)
        * [filter](#reference-options-filter)
        * [plain](#reference-options-plain)
        * [prefix](#reference-options-prefix)
        * [time](#reference-options-time)
        * [tty](#reference-options-tty)
    * [Filter Format](#reference-filter)
    * [Add and Remove Filters](#add-and-remove-filters)
* [Performance](#performance)
* [License](#license)

<a name="examples"></a>
## Examples

> see the [/examples](https://github.com/bretcope/neo-debug/tree/master/examples) directory for more

<a name="examples-simple"></a>
### Simple

If you don't care about any of the additional features, you can use neo-debug just like [visionmedia/debug](https://github.com/visionmedia/debug)

```javascript
process.env.DEBUG = 'examples:*';
var debug = require('neo-debug')('examples:simple');

debug('this is a simple example');
debug('of how to use neo-debug');
```

in TTY mode, this outputs:

```
  examples:simple this is a simple example
  examples:simple of how to use neo-debug +2ms
```

<a name="examples-change-filter"></a>
### Change Filter at Runtime

```javascript
process.env.DEBUG = 'examples:one';

var neoDebug = require('neo-debug');
var debug1 = neoDebug('examples:one');
var debug2 = neoDebug('examples:two');

debug1('one');
debug2('two');

neoDebug.filter = 'examples:*';

debug1('three');
debug2('four');

/*
  examples:one one
  examples:one three +2ms
  examples:two four
*/
```

<a name="examples-custom-output"></a>
### Custom Output Stream

```javascript
var neoDebug = require('../lib/neo-debug');
neoDebug.filter = 'examples:*';

/*
neo-debug writes to stdout by default. If we want to write to stderr instead, 
we can use the fd property
 */
var stderr = neoDebug('examples:stderr', { fd: 'stderr' });
stderr('this will output to stderr');

/*
If we want to output to something other than stdout or stderr, we can pass any 
object with a `write` function which accepts a single string argument.

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
Note that neo-debug writes to our stream in plain-text mode. If our stream object had the 
property `isTTY` set to `true`, neo-debug would write to it in TTY mode instead.
 */

/*
  examples:stderr this will output to stderr
flushing buffer...
2014-04-14T06:41:09.915Z examples:custom-output this will be written to the SimpleStream buffer
*/
```

<a name="reference"></a>
## Reference

<a name="reference-options"></a>
### Options

neo-debug can be configured on the global level, or on the individual debugger level. Editing an individual debugger's configuration will override the global setting for that debugger.

Global settings are set on the neoDebug function and take effect immediately on all debuggers which do not override the setting:

```javascript
var neoDebug = require('neo-debug');
neoDebug.fd = 'stderr';
```

Individual debugger options can be set at creation time by passing an additional argument to the neoDebug function:

```javascript
var debug = neoDebug('prefix:string', { fd: 'stderr' });
```

or at a later time using the debugger's update method:

```javascript
debug.update({ fd: 'stdout' });
```

The available options are:

<a name="reference-options-background"></a>
#### background

> String - default: "none"

Allows a background color to be set. _Only applicable in TTY mode._

Accepted values: `none, white, grey, black, red, green, yellow, blue, magenta, cyan`

<a name="reference-options-color"></a>
#### color

> ___individual config only___ - String - defaults to next color in the global colors property

Sets the color used in TTY output.

Accepted values: `none, white, grey, black, red, green, yellow, blue, magenta, cyan`

<a name="reference-options-colors"></a>
#### colors

> ___global config only___ - Array of Strings - default: ['red', 'blue', 'green', 'magenta', 'cyan', 'grey']

The array of colors which will be used when a debugger does not explicitly specify a color. For each new debugger, neo-debug simply selects the next color in the list. When it gets to the end of the list, it will recycle to the beginning.

<a name="reference-options-colorwholeline"></a>
#### colorWholeLine

> Boolean - default: false

Normally, only the debugger namespace/prefix and the time difference suffix (if applicable) are output in color. If `colorWholeLine` is true, the whole line will be output in color (and with a background, if set). _Only applicable in TTY mode._

<a name="reference-options-enable"></a>
#### enable

> ___individual config only___ - Boolean - default: undefined

Allows the debugger to override the global filter. If set to `true`, the debugger will output even if it is not included or excluded from the global filter. If set to `false`, the debugger will not output, even if it is included in the global filter.

I would recommended against using this option in most situations, but it may be useful in limited circumstances or for temporary testing.

<a name="reference-options-fd"></a>
#### fd

> String|Stream - default: 'stdout'

Allows the output to be sent to another file descriptor or stream interface instead of stdout. See the [Custom Output Stream](#examples-custom-output) example for more information.

<a name="reference-options-filter"></a>
#### filter

> ___global config only___ - String - default: process.env.DEBUG

Determines which debuggers should output and which should be silent. See [Filter Format](#reference-filter). This can be configured before runtime by using the `DEBUG` environment variable.

<a name="reference-options-plain"></a>
#### plain

> ___individual config only___ - Boolean - default: true

If false, the debugger will not output when in plain-text mode.

<a name="reference-options-prefix"></a>
#### prefix

> ___individual config only___ - String

This allows the prefix to be changed after creation. For example:

```javascript
var debug = neoDebug('examples:original');
debug('one');
debug.update({ prefix: 'examples:changed' });
debug('two');

/*
  examples:original one
  examples:changed two +1ms
 */
```

The value of this option at creation time will be ignored in favor of the first argument to the neoDebug function.

<a name="reference-options-time"></a>
#### time

> Object|String - default: { tty: 'diff', plain: 'iso' }

Determines which time format (if any) to use in the different output modes. An object can be used to set TTY and plain-text modes separately, or a single string can be used to set both at the same time.

Available Formats:

```
iso   Prefixes the output with the ISO timestamp. example: "2014-04-14T06:26:21.581Z"
utc   Prefixes the output with the UTC timestamp. example: "Mon, 14 Apr 2014 07:42:04 GMT"
diff  Outputs the time since the last output as a suffix to the output. example: "+2ms"
none  Does not output any datetime information
```

<a name="reference-options-tty"></a>
#### tty

> ___individual config only___ - Boolean - default: true

If false, the debugger will not output when in TTY mode.

<a name="reference-filter"></a>
### Filter Format

neo-debug uses the exact same filter format as [visionmedia/debug](https://github.com/visionmedia/debug#wildcards). This means you can easily configure both debug and neo-debug at the same time which may be handy if you have dependencies which use debug.

It is a comma or space separated list which supports the wildcard `*` character. To exclude a pattern, prefix it with a minus `-` sign. `DEBUG=connect:*` would include all debuggers which begin with `connect:`. `DEBUG=* -connect:*` would include all debuggers except those which begin with `connect:`.

<a name="add-and-remove-filters"></a>
### Add and Remove Filters

If you would like to add and remove filters without affecting any previously applied filters, you can use the `neoDebug.addFilter(pattern, [exclude])` method.

```javascript
var neoDebug = require('neo-debug');
var debug = neoDebug('example:one');

neoDebug.addFilter('example:*');

//to exclude a pattern, send true as the second argument
neoDebug.addFilter('example:quiet', true);
```

To remove the filters we just added, use `neoDebug.removeFilter(pattern, [exclude])`. It returns true if the pattern was found and removed, otherwise false.

```javascript
neoDebug.removeFilter('example:*');
neoDebug.removeFilter('example:quiet', true);
```

> There is some overhead involved every time you add or remove filters, so it is best to avoid calling these methods repeatedly.

You can also get a list of current filters by calling `neoDebug.getFilters()`.

```javascript
console.log(neoDebug.getFilters());
/*
{
  includes: ['example:*'],
  excludes: ['example:quiet']
}
*/
```

There is also a `neoDebug.hasFilter(pattern, [inExcludes])` which returns true if the filter already exists.

<a name="performance"></a>
## Performance

For its additional configurability and features, neo-debug pays some performance cost compared to the debug module. When actually outputting to the console, the performance difference between debug and neo-debug is about 5%. When not outputting anything (silent/NOOP mode), the debug module performs about 3.5x faster; however, this difference is in the tens of nanoseconds per call (about 20 on my Core i7-4770K), and it's very unlikely the difference would even be measurable in a production system unless the number of calls to debug was enormous.

Here are some benchmark test results (see [examples/debug-vs-neo.js](https://github.com/bretcope/neo-debug/blob/master/examples/debug-vs-neo.js) for the code):

```
neo-d (tty) performed 10,000 operations in 3.6714 seconds (2,724 ops/sec)
debug (tty) performed 10,000 operations in 3.5223 seconds (2,839 ops/sec) +1.042x faster
neo-d (plain text) performed 10,000 operations in 0.0416 seconds (240,314 ops/sec)
debug (plain text) performed 10,000 operations in 0.0393 seconds (254,140 ops/sec) +1.058x faster
neo-d (noop) performed 100,000 operations in 0.0036 seconds (27,570,554 ops/sec)
debug (noop) performed 100,000 operations in 0.0010 seconds (97,432,745 ops/sec) +3.534x faster
```

<a name="license"></a>
## License

MIT
