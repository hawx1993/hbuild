/**
 * Created by trigkit4 on 2017/6/21.
 */
//a webpack plugin for end building log info
'use strict'
const colors = require('colors')

module.exports = class LogPlugin {
    constructor(host,port) {
        this.host = host
        this.port = port
    }
    apply(compiler) {
        compiler.plugin('done', () => {
            setTimeout(function() {
                /*eslint-disable */
                console.log()
                console.log(`> ${colors.yellow('hbuild is running at')} ${colors.green(`${this.host}:${this.port}`)}\n`)
            }.bind(this),0)
        })
    }
}
