/**
 * Created by trigkit4 on 2017/5/8.
 */
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var express = require('express');
var webpack = require('webpack');
var config = require('../hbuild.config');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
var autoprefixer = require('autoprefixer');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {

    },
    output: {
        path: resolve(config.outputPath),
        publicPath: '/static',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': resolve('src'),
            'components': resolve('components'),
            'lib': resolve('lib')
        }
    },
    module: {
        rules: [
            // {{#if_eq project "vue"}}
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                include: resolve('src'),
                exclude: /node_modules/
            },
            // {{/if_eq}}
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                include: resolve('src'),
                use: {
                    loader: 'babel-loader?cacheDirectory=node_modules/.cache/babel_cache',
                    options: {
                        presets: ['env']
                    },
                    //'transform-runtime' 插件告诉 babel 要引用 runtime 来代替注入。
                    plugins: ['transform-runtime']
                }
            },
            {
                test: /\.(css|less|scss)$/,
                // {{#if_eq preProcessor "LESS" }}
                use: [ 'style-loader', 'css-loader' ,'less-loader']
                // {{/if_eq}}
                // {{#if_eq preProcessor "SASS" }}
                // use: [ 'style-loader', 'css-loader' ,'sass-loader']
                // {{/if_eq}}
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            title: config.title,
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),
        //提供全局Vue对象
        new webpack.ProvidePlugin({
            Vue: ['vue/dist/vue.esm.js', 'default']
        }),
        new webpack.optimize.CommonsChunkPlugin('common.js'),
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
    ]
};
