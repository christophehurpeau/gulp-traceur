'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var traceur = require('./index');

it('should transpile with Traceur', function (cb) {
	var stream = traceur({blockBinding: true});

	stream.on('data', function (file) {
		assert(/Foo/.test(file.contents.toString()));
		cb();
	});

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/fixture.js',
		contents: new Buffer('import {Foo} from \'./foo\';')
	}));
});

it('should pass syntax errors', function (cb) {
	var stream = traceur();

	stream.on('error', function (err) {
		assert(/Semi-colon expected/.test(err.message));
		cb();
	});

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/fixture.js',
		contents: new Buffer('cons x = 1;')
	}));
});

it('should expose the Traceur runtime path', function () {
	assert(typeof traceur.RUNTIME_PATH === 'string');
	assert(traceur.RUNTIME_PATH.length > 0);
});
