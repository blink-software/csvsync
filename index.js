var _isString = require('lodash.isstring');

/**
 * convert javscript object/array into a .csv string
 */
function stringify(data, opts)
{
	opts = opts || {};
	var delimiter = opts.delimiter || ',';
	var quoteAll = opts.quoteAll;

	// iterate rows
	return data.reduce(function(csv, row) {
		row = row.map(function(field) {
			// console.log(field);
			if (_isString(field))
			{
				// escape " in the field
				if (field.indexOf('"') > -1)
				{
					field = field.replace(/"/g, '""');
				}

				// enclose the field in " " if contains dangerous chars
				if (quoteAll ||
					field.indexOf(delimiter) > -1 ||
					field.indexOf('\n') > -1 ||
					field.indexOf('"') > -1)
				{
					field = '"' + field + '"';
				}
			}

			return field;
		});

		// make the row and glue it to the result
		return csv += row.join(delimiter) + '\n';
	}, '');
}

/**
 * convert .csv string into javascript object/array
 */
function parse(csv, opts)
{
	opts = opts || {};
	var delimiter = opts.delimiter || ',';

	// in case we receive a buffer straight from readFileSync
	csv = csv.toString();

	// avoid empty arrays on last row
	csv = csv.trim();

	var prelines = csv.split(/\n|\r\n|\r/);

	// join lines with odd number of quotes again (those are the ones
	// with newlines embedded in fields)
	var	i = 0,
		currentLine,
		lines = [];
	while (i < prelines.length) {
		currentLine = prelines[i++];
		while (currentLine.split('"').length % 2 == 0) {
			// ^^^ see http://stackoverflow.com/a/881111/1181665
			// Note that we use Unix-like line endings in the parsed strings.
			currentLine += '\n' + prelines[i++];
		}
		lines.push(currentLine);
	}

	var header;

	if (opts.skipHeader)
		lines.shift();

	if (opts.returnObject)
	{
		if (opts.headerKeys)
		{
			header = opts.headerKeys;
		}
		else
		{
			// parse the header row to obtain the keys
			// turn off returnObject for the moment, so we get the array
			opts.returnObject = false;
			header = parse_line(lines.shift());
			opts.returnObject = true;
		}
	}

	function parse_line(line)
	{
		var row_out = opts.returnObject ? {} : [];

		var pos = 0;	// start of field
		var endpos = 0;	// end of field
		var idx = 0;	// for keeping track of header keys

		// get the quotes out of sight
		// (the only way we get 3 quotes in a row is beginning of line or field
		// so we handle those corner cases individually)
		// use ^^QUOTE@@ as this is something we don't expect to occur in the wild
		line = line.replace(/^"""/, '"^^QUOTE@@');
		line = line.replace(/,"""/g, ',"^^QUOTE@@');
		line = line.replace(/""/g, '^^QUOTE@@');

		do {
			// if we've got quoted field, find the corresponding " (next one)
			if (line.charAt(pos) === '"')
			{
				pos++;	// skip the opening "

				// find the closing one
				endpos = line.indexOf('"', pos + 1);

				field = line.substr(pos, endpos - pos);

				// advance it to the delimiter
				endpos++;
			}
			// handle empty fields (e.g. ",,,")
			else if (line.charAt(pos) === delimiter)
			{
				field = '';
				endpos = pos;
			}
			else
			{
				// find the next delimiter
				endpos = line.indexOf(delimiter, pos + 1);

				// or end of line
				if (endpos === -1)
					endpos = line.length;

				field = line.substr(pos, endpos - pos);
			}

			// bring back the quotes, unquoted already
			field = field.replace(/\^\^QUOTE@@/g, '"');

			if (opts.returnObject)
			{
				// if header doesn't define that column, skip it (we can't
				// know what key that would be)
				if (header[idx])
					row_out[ header[idx] ] = field;
			}
			else
			{
				row_out.push(field);
			}

			pos = endpos + 1;
			idx++;

		} while (endpos < line.length);

		return row_out;
	}

	return lines.map(parse_line);
}

exports.parse = parse;
exports.stringify = stringify;
