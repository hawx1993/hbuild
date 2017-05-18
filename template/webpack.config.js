/**
 * Created by trigkit4 on 2017/5/8.
 */
var fs = require('fs');
var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./hbuild.config');
var autoprefixer = require('autoprefixer');

function resolve (dir) {
    return path.join(__dirname,  dir)
}

var pageDir = resolve('src/pages');
var entryFilesArray = fs.readdirSync(pageDir);
var entryFiles = {};
entryFilesArray.forEach(function(file){
    var state = fs.statSync(pageDir+'/'+file);
    if(state.isDirectory(file)){
        var dirname = path.basename(file);
        entryFiles[dirname+'/index'] = [
            'webpack-hot-middleware/client?reload=true',
            {{#if_eq project 'react'}}
            resolve('src/pages/'+ dirname + '/index.jsx')
            {{else}}
            resolve('src/pages/'+ dirname + '/index.js')
            {{/if_eq}}
        ]
    }
});
module.exports = {
    entry: entryFiles,
    output: {
        path:  resolve('/build/static/'),
        publicPath: '/static',
        filename: '[name].js',
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json','.less', '.scss', '.css','jsx'],
        alias: {
            '@': resolve('src'),
            'components': resolve('src/components'),
            'lib': resolve('src/lib'){{#if_eq project 'vue'}},
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
                include: resolve('src'),
                exclude: /node_modules/,
                options: {
                    postcss: [autoprefixer()]
                }
            },{{/if_eq}}
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                include: resolve('src'),
                loader: 'babel-loader?cacheDirectory'
            },
            {{#if_eq preProcessor 'LESS'}}
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // 从JS字符串生成样式节点
                }, {
                    loader: "css-loader" // 将CSS转化成CommonJS
                }, {
                    loader: "less-loader" // 将LESS编译成CSS
                }]
            },{{/if_eq}}
            {{#if_eq preProcessor 'SASS'}}
            {
                test: /\.scss$/,
                    use: [{
                    loader: "style-loader" // 将 JS 字符串生成为 style 节点
                },  {
                    loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                },  {
                    loader: "sass-loader" // 将 Sass 编译成 CSS
                }]
            },{{/if_eq}}
            {
                test: /\.html$/,
                loader: "ejs-template-loader"
            },
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
            {{#if_eq project 'vue'}}
            Vue: ['vue/dist/vue.esm.js', 'default'],{{/if_eq}}
            $: 'zepto-webpack'
        }),
        new webpack.optimize.CommonsChunkPlugin('common')
    ]
}
