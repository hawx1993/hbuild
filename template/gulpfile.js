/**
 * Created by trigkit4 on 2017/5/8.
 */
const path = require('path');
const fs = require('fs');
const gulp = require("gulp");
const del = require("del");
const ejs = require('gulp-ejs');
const replace = require('gulp-replace');
const htmlmin = require("gulp-htmlmin");
const gulpSequence = require('gulp-sequence');
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const named = require('vinyl-named');
const rename = require('gulp-rename');
const webpack = require('webpack');
const express = require('express');
const config = require('./hbuild.config');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const webpackConfig = require('./webpack.config');

let myConfig = Object.create(webpackConfig);

const getEnvironment = () => {
    let env = {
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
let args = getEnvironment();
function resolve(arg1,arg2,arg3) {
    let dir1 = arg1 || '', dir2 = arg2 || '', dir3 = arg3 || '';

    return path.join(config[dir1],config[dir2],config[dir3])
}
gulp.task("clean", function() {
    if (!config.buildPath) return null;

    del.sync(config.buildPath);
});

gulp.task("assets", function() {
    return gulp.src([resolve('src','assets')+'/*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'])
        .pipe(gulp.dest(resolve('buildPath','staticPath')))
        .pipe(connect.reload());

});
gulp.task("html", function() {
    if (args.dev) {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '/static'))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest(resolve('buildPath','pages'))).pipe(connect.reload());
    } else {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '../../'+resolve('staticPath')))
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
            .pipe(gulp.dest(resolve('buildPath','pages')));
    }
});

//监听文件变化
gulp.task("watch", ["html"], function() {
    //watch html
    let urls = [config.src+"/**/*.html"];
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
    let compiler = webpack(myConfig);

    return new Promise(function(resolve, reject) {
        let compilerRunCount = 0;

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
    let compiler;
    let hotMiddleString = 'webpack-hot-middleware/client?reload=true';
    try {
        compiler = webpack(webpackConfig)
    } catch (err) {
        console.log(err.message);
        process.exit(1)
    }

    for(let file in webpackConfig.entry){
        webpackConfig.entry[file].unshift(hotMiddleString)
    }
    const app = express();
    const devMiddleWare = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        quiet: true
    });
    connect.server({
        root: ['./', resolve('buildPath'),resolve('buildPath','pages')],
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
//eslint
gulp.task('eslint', function() {
    let source = [path.join(config.src, '/**/*.{js,vue,jsx}'),
        '!' + path.join(config.lib, '/**/*.js')];
    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.format())
});
