module.exports = function (grunt) {

    "use strict";

    var fs = require("fs"),
        async = require("async");

    grunt.registerMultiTask("append-sourcemapping", "Append JavaScript sourcemapping URL comments to files", function () {
        var that = this,
            done = that.async(),
            files = that.files,
            options = that.options({
                extAppend: '.map',
                pathPrefix: '',
                mapPathCalc: null
            }),
            append = function(sourceFile, destFile, mapFile, callback) {
                fs.appendFile(destFile, "/*\n//@ sourceMappingURL=" + mapFile + "\n*/", function(err) {
                    if(err){throw err;}

                    // Print a success message.
                    grunt.log.writeln('File "' + destFile + '" created with appended sourceMappingURL comment.');

                    callback(err);
                });
            }
        ;

        async.forEach(files, function(file, files_done) {
            async.forEach(file.src, function(src, src_done) {
                var dest = file.dest,
                    map = dest
                ;

                if(typeof options.mapPathCalc === 'function') {
                    map = options.mapPathCalc.call(that, map, options);
                }

                map = options.pathPrefix + map + options.extAppend

                if (!grunt.file.exists(src)) {
                    return src_done('Source file "' + src + '" not found.');
                }

                if (grunt.file.isDir(src)) {
                    return src_done('Source cannot be a directory. "' + src + '"" given.');
                }

                if (!grunt.file.exists(dest)) {
                    append(src, dest, map, src_done);
                } else {
                    fs.readFile(dest, function(err, data) {
                        if (err) {throw err;}
                        if(!data.toString().match(/\/\/@ sourceMappingURL=[^\n]*\n\*\/\s*$/)) {
                            append(src, dest, map, src_done);
                        } else {
                            src_done(err);
                        }
                    });
                }

            }, files_done);
        }, function(err) {
            if (err) {
                grunt.log.error(err);
                done(false);
            }
            done();
        });
    });
};
