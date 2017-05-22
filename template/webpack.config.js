/**
 * Created by trigkit4 on 2017/5/8.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./hbuild.config');
const autoprefixer = require('autoprefixer');

function resolve (dir1,dir2) {
    let path1 = dir1 || '',path2 = dir2 || '';
    return path.join(__dirname,  path1,path2)
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
            path.join(__dirname,config.src,config.pages ,dirname , 'index.jsx')
            {{else}}
            path.join(__dirname,config.src,config.pages , dirname ,'index.js')
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
        extensions: ['.js', '.vue', '.json','.less', '.scss', '.css','jsx'],
        alias: {
            '@': resolve(config.src),
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
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [
                    autoprefixer(),
                ]
            }
        }),
        new webpack.optimize.CommonsChunkPlugin('common')
    ]
}
