/**
 * Created by trigkit4 on 2017/5/8.
 */
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const config = require('./hbuild.config');
const autoprefixer = require('autoprefixer');

function resolve (...pathname) {
    return path.join(__dirname, ...pathname )
}
let pageDir = resolve(config.src,config.pages);
let entryFilesArray = fs.readdirSync(pageDir);
let entryFiles = {};
entryFilesArray.forEach(function(file){
    let state = fs.statSync(pageDir+'/'+file);
    if(state.isDirectory(file)){
        let dirname = path.basename(file);
        entryFiles[dirname+'/index'] = [
            {{#if_eq project 'react'}}
            resolve(config.src,config.pages ,dirname , 'index.jsx')
            {{else}}
            resolve(config.src,config.pages , dirname ,'index.js')
            {{/if_eq}}
        ]
    }
});
module.exports = {
    entry: entryFiles,
    output: {
        publicPath: '/'+config.staticPath,
        filename: '[name].js',
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json','.less', '.scss','.styl','.css','.jsx'],
        alias: {
            'src': resolve(config.src),
            'components': resolve(config.src,config.components),
            'common': resolve(config.src,config.common),
            'lib': resolve(config.src,config.lib){{#if_eq project 'vue'}},
            'vue': 'vue/dist/vue.js',
            //防止运行时出现构建问题
            'vue$': 'vue/dist/vue.common.js'{{/if_eq}}
        }
    },
    module: {
        rules: [
            {{#if_eq project 'vue'}}
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                include: resolve(config.src),
                exclude: /node_modules/,
                options: {
                    postcss: [autoprefixer()]
                }
            },{{/if_eq}}
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                include: resolve(config.src),
                loader: 'babel-loader?cacheDirectory'
            },
            {{#if_eq template 'ejs'}}
            {
                test: /\.(tpl|html)$/,
                loader: "ejs-template-loader"
            },{{/if_eq}}
            {{#if_eq template 'mustache'}}
            {
                test: /\.(tpl|html)$/,
                loader: 'mustache-loader'
            },{{/if_eq}}
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(png|jpe?g|gif|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=100&name=[name].[ext]',
                exclude: /^node_modules$/
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        //提供全局对象
        new webpack.ProvidePlugin({
            $: 'zepto-webpack'
            {{#if_eq project 'vue'}},
            Vue: ['vue/dist/vue.esm.js', 'default'],{{/if_eq}}
        }),
        new webpack.optimize.CommonsChunkPlugin('common')
    ]
}
