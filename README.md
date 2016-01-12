# csvsync [![Build Status](https://travis-ci.org/soquel/csvsync.svg?branch=master)](https://travis-ci.org/soquel/csvsync)

Read and write .csv files in node *synchronously*.

# Basic Usage

### Read (parse)

```js
var csvsync = require('csvsync');
var fs = require('fs');

var csv = fs.readFileSync('in_file.csv');
var data = csvsync.parse(csv);

// 'data' now contains an array of arrays parsed from in_file.csv
```

#### Options 

All options are optional. Example:

```js
var data = csvsync.parse(csv, {
    skipHeader: true,
    returnObject: true,
    headerKeys: ['column1', 'column2']
});
```



* `skipHeader: Boolean`

Ignores the first line of input.

* `returnObject: Boolean`

Instead of the default array return value, returns an object with keys
constructed from the first row. Implies `skipHeader`.

* `headerKeys: array`

Allows to provide own keys for the returned object. Useful when the header
is human-readable or non-existent and you still want to get an object instead
of an array. Valid only in `returnObject: true` mode.


### Write (stringify)

Complete example:

```js
var csvsync = require('csvsync');
var fs = require('fs');

var data = [
    ['this', 'is', 'row', 1],
    ['and', 'foo "bar" baz', 'is', 'here'],
];

var csv = csvsync.stringify(data);
fs.writeFileSync('out_file.csv', csv);

// out_file.csv now contains:
// 
// this,is,row,1
// and,"foo ""bar"" baz",is,here

```


# Installation

```bash
$ npm install csvsync --save
```

# Rationale

Often when writing utility scripts in node one needs to read or write .csv
files. Most npm packages do it asynchronously in one way or another
(callbacks, promises, streams).
For use cases where, in two lines of code, you just want to load or save a .csv
file from/to a javascript array or object, this package is a good solution.

# About

Does one thing and does it good. It won't read or write files and/or convert
from JSON.
But it will properly escape .csvs during writing and correctly handle escaped
fields when reading.

Since there is no definitive .csv spec, it follows the rule:

> Fields containing line breaks (CRLF), double quotes, and commas should be enclosed in double-quotes.

[http://tools.ietf.org/html/rfc4180](http://tools.ietf.org/html/rfc4180), section 2.2.

It works with Linux, Mac and Windows line endings.


# Tests

Run the test suite (requires [tape](https://github.com/substack/tape) and [tap-spec](https://github.com/scottcorgan/tap-spec), so make sure to install dev dependencies):

```bash
$ export NODE_ENV=dev
$ npm install
$ npm test
```

# License

ISC
