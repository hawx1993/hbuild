/**
 * Created by trigkit4 on 2017/5/8.
 */
var fs = require('fs');
var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./hbuild.config');
var autoprefixer = require('autoprefixer');
var StringReplacePlugin = require('string-replace-webpack-plugin');

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
            resolve('src/pages/'+ dirname + '/index.js')
        ]
    }
});
module.exports = {
    entry: entryFiles,
    output: {
        path:  resolve('/build/static/'),
        publicPath: '/static',
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json','.less', '.scss', '.css','jsx'],
        alias: {
            '@': resolve('src'),
            'components': resolve('src/components'),
            'lib': resolve('src/lib')
        }
    },
    module: {
        rules: [
            {{#if_eq project 'vue'}}
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                include: resolve('src'),
                exclude: /node_modules/
            },{{/if_eq}}
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // 从JS字符串生成样式节点
                }, {
                    loader: "css-loader" // 将CSS转化成CommonJS
                }, {
                    loader: "less-loader" // 将LESS编译成CSS
                }]
            },
            {
                test: /\.html$/,
                loader: "ejs-template-loader"
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=100&name=[name].[ext]',
                exclude: /^node_modules$/
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        {{#if_eq project 'vue'}}
        //提供全局Vue对象
        new webpack.ProvidePlugin({
            Vue: ['vue/dist/vue.esm.js', 'default']
        }),{{/if_eq}}
        {{#useZepto}}
        new webpack.ProvidePlugin({
            $: 'zepto-webpack'
        }),{{/useZepto}}
        new webpack.optimize.CommonsChunkPlugin('common')
    ]
};
