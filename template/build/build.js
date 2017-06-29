/**
 * Created by trigkit4 on 2017/5/8.
 */
'use strict';
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

const {task, input , output, start} = require('./gulp-named');
const {util,resolve} = require('./util');
const hash = util.getHash();
const args = util.getEnvironment();
const {host, port, open, src, lib} = config

task("clean", ()=> {
    if (!config.buildPath) return null;

    del.sync(config.buildPath);
});

task("assets", ()=> {
    return input(resolve('src','assets','*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'))
        .pipe(cache(imagemin({
            optimizationLevel: 7,
            progressive: true
        })))
        .pipe(output(resolve('buildPath','staticPath',hash,'buildAssets')))
});
task("html", ()=> {
    let stream = function (options) {
        return input(resolve('src','pages','/*/+([^\.]).html'))
            .pipe(cache(ejs()))
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('staticPath',hash)))
            .pipe(replace(/\$\$_STATICPATH_\$\$/g,resolve('staticPath',hash,'buildAssets')))
            .pipe(options)
            .pipe(cache(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            })))
            .pipe(output(resolve('buildPath','pages')));
    }
    if (args.dev) {
        stream(cache(htmlmin()))
    } else {
        stream(cache(htmlmin({
            minifyJS: true,
            minifyCSS: true,
            collapseWhitespace: true,
            removeComments: true
        })))
    }
});
//生产环境拷贝mock数据至编译目录
task('copyMock', () => {
    if(!args.dev && config.useMock){
        return input(resolve('mock/**/*'))
            .pipe(output(resolve('buildPath','mock')))
    }
})
task("webpack", ()=> {
    const NEW_CONFIG = Object.create(webpackConfig);
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
    let groupCssLoaders = ['style-loader','css-loader','postcss-loader'];
    let cssProcessors =
        {{#if_eq preprocessor 'LESS'}}
        {
            test: /\.css$|\.less$/,
            loaders: groupCssLoaders.concat('less-loader')
        }{{/if_eq}}{{#if_eq preprocessor 'SASS'}}
        {
            test:  /\.css$|\.scss$/,
            loaders: groupCssLoaders.concat('sass-loader')
        }{{/if_eq}}{{#if_eq preprocessor 'stylus'}}
        {
            test: /\.css$|\.styl$/,
            loaders: groupCssLoaders.concat('stylus-loader')
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
task("dev",()=> {
    start("server");
});
//部署日常，预发或线上
let taskName = process.argv.pop();
taskName !== 'dev' && task(taskName, ()=> {
    start("build");
});

task('build', (cb)=> {
    gulpSequence('clean', 'webpack', 'html', 'assets','copyMock',cb);
});

//启动本地服务器及mock server
task('server', ['build'], ()=> {
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
    server.listen(port|| 3002, host, function() {
        if(open){
            require('opn')(`http://${host}:${port || 3002}`)
        }
    })
});
//eslint
task('eslint', ()=> {
    let source = [resolve(src, '/**/*.{js,vue,jsx}'),
        '!' + resolve(lib, '/**/*.js')];
    return input(source)
        .pipe(eslint())
        .pipe(eslint.format())
});
