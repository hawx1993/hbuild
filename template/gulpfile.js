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
    rename = require('gulp-rename'),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    config = require('./hbuild.config'),
    HappyPack = require('happypack'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    webpackConfig = require('./webpack.config');


var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

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
gulp.task("js", function() {
    var source = [
            path.join('src/pages', '/**/*.js'),
            path.join('src/components', '/**/*.js'),
            path.join('src/pages', '/**/*.jsx'),
            path.join('src/components', '/**/*.jsx'),
            path.join('src/pages', '/**/*.vue'),
            path.join('src/components', '/**/*.vue')
        ],
        stream = gulp.src(source).pipe(
            webpackStream({
                module: {
                    loaders: [
                        { test: /\.vue$/, loader: 'vue' },
                    ]
                }
            })
        );

    stream = stream.pipe(gulp.dest(path.join(config.outputPath)));

    stream = stream.pipe(connect.reload());

    return stream;
});
gulp.task('css', function() {
    var source = [
            path.join('src/pages', '/**/*.less'),
            path.join('src/components', '/**/*.less')
        ],
        stream = gulp.src(source, {
            base: 'src'
        });

    stream = stream.pipe(gulp.dest(path.join(config.outputPath)));

    stream = stream.pipe(connect.reload());

    return stream;
});

//监听HTML文件变化
gulp.task("watch", ["html", "js", "css"], function() {
    //watch html
    var urls = ["src/**/*.html"];
    gulp.watch(urls, function() {
        gulp.start("html");
    });

    var jsSource = [path.join('src', '/**/*.{' + 'js' + ',jsx}'), path.join('src', '/**/*.{' + 'vue' + ',jsx}')];
    // watch js
    var jsFile = jsSource.slice(0);
    gulp.watch(jsFile, function() {
        gulp.start('js')
    })
    var cssSource = [path.join('src', '/**/*.{' + 'less' + ',css}')];
    // watch css
    var cssFile = cssSource.slice(0);
    gulp.watch(cssFile, function() {
        gulp.start('css')
    })

});
gulp.task("webpack", function() {
    //线上环境
    if (!args.dev) {
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"production"'
                }
            })
        );
        webpackConfig.plugins.push(
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
    } else {
        webpackConfig.plugins.push(
            new HappyPack({
                id: 'jsHappy',
                tempDir: 'node_modules/.cache/happypack_cache',
                cache: true,
                threadPool: happyThreadPool,
                loaders: ['babel-loader']
            })
        );
    }

    var compiler = webpack(webpackConfig);

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
gulp.task("dev", function() {
    gulp.start("start");
});
//部署日常，预发或线上
var taskName = process.argv.pop();
taskName !== 'dev' && gulp.task(taskName, function() {
    gulp.start("build");
});

gulp.task('build', function(cb) {
    if (args.dev) {
        gulpSequence('clean', 'webpack', 'html', 'assets', 'watch', cb);
    } else {
        gulpSequence('clean', 'webpack', 'html', 'assets', cb);
    }
});

//启动本地服务器及mock server
gulp.task('start', ['build'], function() {
    args.dev && connect.server({
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
                }
            ];
        },
        livereload: true
    });
});
