'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var traceur = require('traceur');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');

module.exports = function (options) {
	var _options = options || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-traceur', 'Streaming not supported'));
			return cb();
		}

		var ret;

		var options = objectAssign({}, _options);
		options.filename = file.relative;

		if (file.sourceMap) {
			options.sourceMap = true;
		}

		try {
			ret = traceur.compile(file.contents.toString(), options);

			if (ret.js) {
				file.contents = new Buffer(ret.js);
			}

			if (ret.sourceMap && file.sourceMap) {
				applySourceMap(file, ret.sourceMap);
			}
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-traceur', err));
		}

		if (ret.errors.length > 0) {
			this.emit('error', new gutil.PluginError('gulp-traceur', '\n' + ret.errors.join('\n')));
		}

		this.push(file);
		cb();
	});
};

module.exports.RUNTIME_PATH = traceur.RUNTIME_PATH;
