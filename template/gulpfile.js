/**
 * Created by trigkit4 on 2017/5/8.
 */
const path = require('path');
const gulp = require("gulp");
const del = require("del");
const ejs = require('gulp-ejs');
const crypto = require('crypto');
const replace = require('gulp-replace');
const htmlmin = require("gulp-htmlmin");
const gulpSequence = require('gulp-sequence');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const webpack = require('webpack');
const config = require('./hbuild.config');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const webpackConfig = require('./webpack.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const WebpackDevServer = require('webpack-dev-server');

const NEW_CONFIG = Object.create(webpackConfig);

let util = {
    getHash() {
        const secret = 'hbuild';
        let md5 = crypto.createHash('md5',secret),
            date = new Date(),
            str = date.getTime().toString(),
            hash;
        md5.update(str);
        hash = md5.digest('hex').substr(0, 6);

        return hash;
    },
    getEnvironment() {
        let env = {
            //是否是开发环境
            dev: false, environment: 3
        }, argv = process.argv.pop() || '--dev';
        switch (argv) {
            case '--dev':
                env = {
                    dev: true, environment: 0
                };
                break;
            case '--dev-daily':
                env = {
                    dev: true, environment: 1
                };
                break;
            case '--dev-pre':
                env = {
                    dev: true, environment: 2
                };
                break;
            case '--daily':
                env = {
                    dev: false, environment: 1
                };
                break;
            case '--pre':
                env = {
                    dev: false, environment: 2
                };
                break;
            case '--prod':
                env = {
                    dev: false, environment: 3
                }
        }
        return env;
    }
};
let hash = util.getHash();
let args = util.getEnvironment();

function resolve(...pathname) {
    let buildDir ,pathArray = [];
    for(let name of pathname){
        buildDir = !config[name] ? name || '' : config[name];
        pathArray.push(buildDir)
    }
    return path.join(...pathArray);
}
gulp.task("clean", ()=> {
    if (!config.buildPath) return null;

    del.sync(config.buildPath);
});

gulp.task("assets", ()=> {
    return gulp.src([resolve('src','assets')+'/*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'])
        .pipe(gulp.dest(resolve('buildPath','staticPath',hash,'buildAssets')))
});
gulp.task("html", ()=> {
    if (args.dev) {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('staticPath',hash)))
            .pipe(replace(/\$\$_STATICPATH_\$\$/g,resolve('staticPath',hash,'buildAssets')))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest(resolve('buildPath','pages')))
    } else {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('../','staticPath',hash)))
            .pipe(replace(/\$\$_STATICPATH_\$\$/g,resolve('../','staticPath',hash,'buildAssets')))
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
gulp.task("watch", ["html"], ()=> {
    //watch html
    let urls = resolve(config.src+"/**/*.html");
    gulp.watch(urls, ()=> {
        gulp.start("html");
    });
    //watch assets
    let assets = resolve(config.src,config.assets,'*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)');
    gulp.watch(assets,()=>{
        gulp.start('assets')
    })
});

gulp.task("webpack", ()=> {

    let sourceMap = config.style.sourceMap;
    let extractFileName = config.style.extractFileName;
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
        include: resolve(__dirname, 'src'),
        loader: StringReplacePlugin.replace({
            replacements: replacedValue
        })
    });
    plugins.push(
        new StringReplacePlugin()
    );
    webpackConfig.output.path = resolve(__dirname,config.buildPath,
        config.staticPath,hash);
    function handleCssLoader(processor,loader) {
        rules.push({
            test: processor.test,
            use: ExtractTextPlugin.extract({
                use: [
                    {
                        loader: 'css-loader',options:{
                            sourceMap: sourceMap,
                            minimize: !args.dev
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: sourceMap
                        }
                    },
                    {
                        loader: loader,options:{
                            sourceMap: sourceMap,
                            minimize: !args.dev
                    }
                }]
            })
        });
        plugins.push(new ExtractTextPlugin(extractFileName))
    }
    let cssProcessors = [
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
    ];
    //css提取和压缩
    if(config.style.extract){
        cssProcessors.forEach(processor => {
            if(processor.loaders.includes('less-loader')){
                handleCssLoader(processor,'less-loader')
            }else if(processor.loaders.includes('sass-loader')){
                handleCssLoader(processor,'sass-loader')
            }else if(processor.loaders.includes('stylus-loader')){
                handleCssLoader(processor,'stylus-loader')
            }
        });
    }else{
        rules.push(
            cssProcessors[0]
        )
    }
    //开发环境
    if (args.dev) {
        let hotMiddlewareScript = "webpack-dev-server/client?"+`http://${config.host}:${config.port || 3002}`;
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
        //开发过程无需打开sourcemap
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
//本地开发模式或连接本地mock数据
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
        gulpSequence('clean', 'webpack','html', 'assets', 'watch', cb);
    } else {
        gulpSequence('clean', 'webpack', 'html', 'assets', cb);
    }
});

//启动本地服务器及mock server
gulp.task('server', ['build'], ()=> {
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
    server.listen(config.port, 'localhost', function() {
        let colors = require('colors');
        console.log(colors.green('Listening ' + config.host + ':' + config.port + '/' + config.buildPath +'/'+ config.pages));
        if(config.open){
            require('opn')(`http://${config.host}:${config.port || 3002}`)
        }
    })
});
//eslint
gulp.task('eslint', ()=> {
    let source = [resolve(config.src, '/**/*.{js,vue,jsx}'),
        '!' + resolve(config.lib, '/**/*.js')];
    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.format())
});
