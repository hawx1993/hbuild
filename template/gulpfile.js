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
    config = require('./hbuild.config'),
    HappyPack = require('happypack'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    webpackConfig = require('./webpack.config');


var happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

var getEnvironment= function() {
    var env = {
            //标志环境配置变量，默认为线上环境
            environment: 3,
            //是否是开发环境
            dev: false
        },
        argv;

    try {
        argv = process.argv.pop();
        //本地开发模式，连接本地数据或日常，预发数据库
        if (argv === '--dev') {
            env = {
                dev: true,
                environment: 0
            }
        } else if (argv === '--dev-daily') {
            env = {
                dev: true,
                environment: 1
            }
        } else if (argv === '--dev-pre') {
            env = {
                dev: true,
                environment: 2
            }
            //部署线上，连接日常，预发，线上数据库
        } else if (argv === '--daily') {
            env = {
                dev: false,
                environment: 1
            }
        } else if (argv === '--pre') {
            env = {
                dev: false,
                environment: 2
            }
        } else if (argv === '--prod') {
            env = {
                dev: false,
                environment: 3
            }
        }
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    return env;
};
var args = getEnvironment();

gulp.task("clean", function() {
    del.sync(config.outputPath);
});

gulp.task("icon", function() {
    return gulp.src(['./src/assets/*.+(ico|jpg|png|jpeg|gif|eot|svg|ttf|woff)'])
        .pipe(gulp.dest('./build/static/'));
});
gulp.task("html", function() {
    if(args.dev){
        return gulp.src(['./src/pages/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '/static'))
            .pipe(rename(function (path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest('./build/pages/'));
    }else{
        return gulp.src(['./src/pages/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '../../../build/static/'))
            .pipe(htmlmin({
                minifyJS: true,
                minifyCSS: true,
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(rename(function (path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest('./build/pages/'));
    }
});
//监听HTML文件变化
gulp.task("watch",["html"], function() {
    function watchhtml() {
        var urls =  ["src/**/*.html"];
        gulp.watch(urls, function() {
            gulp.start("html");
        });
    }
    watchhtml();
});
gulp.task("webpack", function() {
    //线上环境
    if(!args.dev) {
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
                uglifyJS:{
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    }
                }
            })
        );
    }else{
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
taskName!=='dev' && gulp.task(taskName, function() {
    gulp.start("build");
});

gulp.task('build', function(cb){
    if(args.dev){
        gulpSequence('clean','webpack','html','icon', 'watch', cb);
    } else {
        gulpSequence('clean', 'webpack','html','icon',cb);
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
                function (req, res, next) {
                    if (req.url.indexOf('mock') !== -1 && req.url.indexOf('.json') === -1) {
                        req.url = req.url.replace(/\?.*/, '') + '.json';
                    }
                    var filepath = path.join('./', req.url);
                    if ('POSTPUTDELETE'.indexOf(req.method.toUpperCase()) > -1
                        && fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                        return res.end(fs.readFileSync(filepath));
                    }
                    next();
                }
            ];
        },
        livereload: args.dev ? {
            port: config.port + 10000
        } : false
    });
});
