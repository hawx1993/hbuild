## zepto

zepto全局引入，主要用于ajax请求，及DOM操作之类，如需去掉zepto，可以在`webpack.config.js`中去掉即可：

```javascript
new webpack.ProvidePlugin({
    $: 'zepto-webpack'
}),
```