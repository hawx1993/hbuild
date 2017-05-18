/**
 * Created by trigkit4 on 2017/5/8.
 */
var path = require('path'),
    os = require('os'),
    fs = require('fs'),
    gulp = require("gulp"),
    del = require("del"),
    ejs = require('gulp-ejs'),
    replace = require('gulp-replace'),
    htmlmin = require("gulp-htmlmin"),
    gulpSequence = require('gulp-sequence'),
    connect = require('gulp-connect'),
    named = require('vinyl-named'),
    rename = require('gulp-rename'),
    webpack = require('webpack'),
    express = require('express'),
    config = require('./hbuild.config'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    webpackConfig = require('./webpack.config');

var myConfig = Object.create(webpackConfig);
myConfig.devtool = "eval";

var getEnvironment = function() {
    var env = {
            //是否是开发环境
            dev: false
        },
        argv = process.argv.pop();
    switch (argv) {
        case '--dev':
        case '--dev-daily':
        case '--dev-pre':
            env = {
                dev: true
            };
            break;
        case '--daily':
        case '--pre':
        case '--prod':
            env = {
                dev: false
            }
    }
    return env;
};
var args = getEnvironment();

gulp.task("clean", function() {
    if (!config.outputPath) return null;

    del.sync(config.outputPath);
});

gulp.task("assets", function() {
    return gulp.src(['./src/assets/*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'])
        .pipe(gulp.dest('./build/static/')).pipe(connect.reload());
});
gulp.task("html", function() {
    if (args.dev) {
        return gulp.src(['./src/pages/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '/static'))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest('./build/pages/')).pipe(connect.reload());
    } else {
        return gulp.src(['./src/pages/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '../../../build/static/'))
            .pipe(htmlmin({
                minifyJS: true,
                minifyCSS: true,
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest('./build/pages/'));
    }
});

//监听文件变化
gulp.task("watch", ["html"], function() {
    //watch html
    var urls = ["src/**/*.html"];
    gulp.watch(urls, function() {
        gulp.start("html");
    });
});

gulp.task("webpack", function() {
    //线上环境
    if (!args.dev) {
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify("production")
                }
            }),
            new ParallelUglifyPlugin({
                cacheDir: 'node_modules/.cache/uglifyjs_cache',
                uglifyJS: {
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    }
                }
            })
        );
    }else {
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"development"'
                }
            }),
            new webpack.HotModuleReplacementPlugin()
        )
    }
    var compiler = webpack(myConfig);

    return new Promise(function(resolve, reject) {
        var compilerRunCount = 0;

        function bundle(err, stats) {
            if (err) {
                return reject(err);
            }
            if (++compilerRunCount === (global.watch ? config.length : 1)) {
                return resolve();
            }
        }
        if (args.dev) {
            compiler.watch(200, bundle);
        } else {
            compiler.run(bundle);
        }
    });
});
//本地开发模式或连接本地mock数据
gulp.task("dev",function() {
    gulp.start("server");
});
//部署日常，预发或线上
var taskName = process.argv.pop();
taskName !== 'dev' && gulp.task(taskName, function() {
    gulp.start("build");
});

gulp.task('build', function(cb) {
    if (args.dev) {
        gulpSequence('clean', 'html', 'assets', 'watch','webpack', cb);
    } else {
        gulpSequence('clean', 'webpack', 'html', 'assets', cb);
    }
});

//启动本地服务器及mock server
gulp.task('server', ['build'], function() {
    var compiler = webpack(webpackConfig);

    var app = express();
    var devMiddleWare = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        quiet: true
    });
    connect.server({
        root: ['./', path.join(config.outputPath), path.join(config.outputPath, 'pages')],
        port: config.port,
        host: config.host,
        middleware: function() {
            return [
                function(req, res, next) {
                    if (req.url.indexOf('mock') !== -1 && req.url.indexOf('.json') === -1) {
                        req.url = req.url.replace(/\?.*/, '') + '.json';
                    }
                    var filepath = path.join('./', req.url);
                    if ('POSTPUTDELETE'.indexOf(req.method.toUpperCase()) > -1 &&
                        fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                        return res.end(fs.readFileSync(filepath));
                    }
                    next();
                },
                app.use(devMiddleWare),
                app.use(require('webpack-hot-middleware')(compiler, {
                    log: () => {}
                }))
            ];
        },
        livereload: true
    });
});
