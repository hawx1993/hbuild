/**
 * Created by trigkit4 on 2017/5/8.
 */
const gulp = require("gulp");
const del = require("del");
const ejs = require('gulp-ejs');
const replace = require('gulp-replace');
const htmlmin = require("gulp-htmlmin");
const gulpSequence = require('gulp-sequence');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const webpack = require('webpack');
const config = require('../hbuild.config');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const webpackConfig = require('./webpack.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const WebpackDevServer = require('webpack-dev-server');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const LogPlugin = require('./log-plugin');

const {util,resolve} = require('./util');
const NEW_CONFIG = Object.create(webpackConfig);
let hash = util.getHash();
let args = util.getEnvironment();
let {host, port, open, src, lib} = config

gulp.task("clean", ()=> {
    if (!config.buildPath) return null;

    del.sync(config.buildPath);
});

gulp.task("assets", ()=> {
    return gulp.src(resolve('src','assets','*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'))
        .pipe(cache(imagemin({
            optimizationLevel: 7,
            progressive: true
        })))
        .pipe(gulp.dest(resolve('buildPath','staticPath',hash,'buildAssets')))
});
gulp.task("html", ()=> {
    if (args.dev) {
        return gulp.src(resolve('src','pages','/*/+([^\.]).html'))
            .pipe(cache(ejs()))
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('staticPath',hash)))
            .pipe(replace(/\$\$_STATICPATH_\$\$/g,resolve('staticPath',hash,'buildAssets')))
            .pipe(cache(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            })))
            .pipe(gulp.dest(resolve('buildPath','pages')))
    } else {
        return gulp.src(resolve('src','pages','/*/+([^\.]).html'))
            .pipe(cache(ejs()))
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('../','staticPath',hash)))
            .pipe(replace(/\$\$_STATICPATH_\$\$/g,resolve('../','staticPath',hash,'buildAssets')))
            .pipe(cache(htmlmin({
                minifyJS: true,
                minifyCSS: true,
                collapseWhitespace: true,
                removeComments: true
            })))
            .pipe(cache(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            })))
            .pipe(gulp.dest(resolve('buildPath','pages')));
    }
});

gulp.task("webpack", ()=> {

    let { sourceMap, extractFileName,extract } = config.style;

    let rules = webpackConfig.module.rules;
    let plugins = webpackConfig.plugins;
    let replacements = config.replacement;
    let replacedValue = replacements.map((val)=>{
        return {
            pattern: val.pattern,
            replacement: function () {
                return val.replace(args)
            }
        }
    });
    rules.push({
        test: /\.jsx?$/,
        include: resolve(__dirname, '../','src'),
        loader: StringReplacePlugin.replace({
            replacements: replacedValue
        })
    });
    plugins.push(
        new StringReplacePlugin()
    );
    webpackConfig.output.path = resolve(__dirname,'../',config.buildPath,
        config.staticPath,hash);
    function handleCssLoader(processor,loader) {
        let cssLoaders = [
            {
                loader: 'css-loader',
                options:{
                    sourceMap: sourceMap,
                    minimize: !args.dev
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: sourceMap,
                    minimize: !args.dev,
                    config: {
                        path: resolve(config.build,'postcss.config.js')
                    }
                }
            },
            {
                loader: loader,
                options:{
                    sourceMap: sourceMap,
                    minimize: !args.dev
                }
            }
        ]
        !extract && cssLoaders.unshift({
            loader: 'style-loader',
            options:{
                sourceMap: sourceMap,
                minimize: !args.dev
            }
        })
        rules.push({
            test: processor,
            use: extract ? ExtractTextPlugin.extract({
                fallback : "style-loader",
                use: cssLoaders
            }) : cssLoaders
        });
        extract  && plugins.push(new ExtractTextPlugin(extractFileName))
    }
    let cssProcessors =
        {{#if_eq preprocessor 'LESS'}}
        {
            test: /\.css$|\.less$/,
            loaders: ['style-loader','css-loader','postcss-loader','less-loader']
        }{{/if_eq}}{{#if_eq preprocessor 'SASS'}}
        {
            test:  /\.css$|\.scss$/,
            loaders: ['style-loader', 'css-loader','postcss-loader', 'sass-loader']
        }{{/if_eq}}{{#if_eq preprocessor 'stylus'}}
        {
            test: /\.css$|\.styl$/,
            loaders: ['style-loader', 'css-loader','postcss-loader', 'stylus-loader']
        }{{/if_eq}}

    handleCssLoader(cssProcessors.test,cssProcessors.loaders.pop());
        //开发环境
    if (args.dev) {
        let hotMiddlewareScript = "webpack-dev-server/client?"+`http://${host}:${port || 3002}`;
        for(let file in webpackConfig.entry) {
            if(webpackConfig.entry.hasOwnProperty(file)){
                webpackConfig.entry[file].unshift(hotMiddlewareScript,"webpack/hot/dev-server")
            }
        }
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"development"'
                }
            }),
            new webpack.HotModuleReplacementPlugin()
        )
        //线上环境
    }else {
        //sourcemap非开发环境有效
        let webpackSourceMap = config.sourceMap;
        if(webpackSourceMap){
            webpackConfig["devtool"] = 'source-map';
        }
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
                    },
                    sourceMap: true,
                    mangle: {
                        except: ['import', '$', 'exports', 'require']
                    }
                }
            })
        );
    }
    let compiler = webpack(NEW_CONFIG);

    return new Promise((resolve, reject)=> {
        let compilerRunCount = 0;

        function bundle(err) {
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
gulp.task("dev",()=> {
    gulp.start("server");
});
//部署日常，预发或线上
let taskName = process.argv.pop();
taskName !== 'dev' && gulp.task(taskName, ()=> {
    gulp.start("build");
});

gulp.task('build', (cb)=> {
    if (args.dev) {
        gulpSequence('clean', 'webpack','html', 'assets', cb);
    } else {
        gulpSequence('clean', 'webpack', 'html', 'assets', cb);
    }
});

//启动本地服务器及mock server
gulp.task('server', ['build'], ()=> {
    webpackConfig.plugins.push(new LogPlugin(host , port))
    let compiler = webpack(webpackConfig);
    let server = new WebpackDevServer(compiler, {
        contentBase: [resolve('./'),resolve('buildPath'),resolve('buildPath','pages')],
        hot: true,
        disableHostCheck: true,
        historyApiFallback: true,
        quiet: false,
        noInfo: false,
        stats: {
            chunks: false,
            colors: true
        },
        publicPath: webpackConfig.output.publicPath,
    });
    server.listen(port, 'localhost', function() {
        if(open){
            require('opn')(`http://${host}:${port || 3002}`)
        }
    })
});
//eslint
gulp.task('eslint', ()=> {
    let source = [resolve(src, '/**/*.{js,vue,jsx}'),
        '!' + resolve(lib, '/**/*.js')];
    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.format())
});
