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
            'lib': resolve('src/lib'),
            'Vue': 'vue/dist/vue.js',
            'vue$': 'vue/dist/vue.common.js'//防止出现运行时构建问题
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
                    postcss: autoprefixer
                }
            },{{/if_eq}}
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                include: resolve('src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['transform-runtime']
                    }
                }
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
                test: /\.(png|jpe?g|gif|woff|svg|eot|ttf)\??.*$/,
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
