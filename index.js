'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var traceurAPI = require('traceur/src/node/api');
var applySourceMap = require('vinyl-sourcemaps-apply');
var objectAssign = require('object-assign');

module.exports = function (options) {
	options = options || {};

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-traceur', 'Streaming not supported'));
			return cb();
		}

		var fileOptions = objectAssign({
            modules: 'commonjs'
        }, options);

		if (file.sourceMap) {
			fileOptions.sourceMaps = true;
		}

		try {
            var compiler = new traceurAPI.NodeCompiler(fileOptions);
			var ret = compiler.compile(file.contents.toString(), file.relative, file.relative, file.base);
            var generatedSourceMap = compiler.getSourceMap();

            if (ret) {
                file.contents = new Buffer(ret);
            }

			if (generatedSourceMap && file.sourceMap) {
				applySourceMap(file, generatedSourceMap);
			}
		} catch (err) {
            if (Array.isArray(err)) {
                this.emit('error', new gutil.PluginError('gulp-traceur', err.join('\n'), {
                    fileName: file.path,
                    showStack: false
                }));
            } else {
    			this.emit('error', new gutil.PluginError('gulp-traceur', err, {
    				fileName: file.path
    			}));
            }
		}

		cb(null, file);
	});
};
