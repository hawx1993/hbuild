/**
 * Created by trigkit4 on 2017/5/8.
 */
var path = require('path'),
    os = require('os'),
    fs = require('fs'),
    gulp = require("gulp"),
    del = require("del"),
    git = require('git-rev-sync'),
    replace = require('gulp-replace'),
    htmlmin = require("gulp-htmlmin"),
    gulpSequence = require('gulp-sequence'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename'),
    webpack = require('webpack'),
    config = require('../hbuild.config'),
    webpackDevServer = require('webpack-dev-server'),
    webpackConfig = require('./webpack.config');


//启动本地服务器及mock server
gulp.task('server', function() {
    connect.server({
        root: ['../', path.join(config.outputPath), path.join(config.outputPath, 'pages')],
        port: config.port,
        host: config.host,
        middleware: function(connect, options) {
            return [
                function mock(req, res, next) {
                    if (req.url.indexOf('mock') !== -1 && req.url.indexOf('.json') === -1) {
                        req.url = req.url.replace(/\?.*/, '') + '.json';
                    }
                    next();
                },
                function(req, res, next) {
                    var filepath = path.join('./', req.url);
                    if ('POSTPUTDELETE'.indexOf(req.method.toUpperCase()) > -1
                        && fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                        return res.end(fs.readFileSync(filepath));
                    }
                    return next();
                }
            ];
        },
        livereload: config.dev ? {
            port: config.port + 10000
        } : false
    });
});

gulp.task("clean", function() {
    del.sync(config.outputPath);
});

