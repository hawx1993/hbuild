/**
 * Created by trigkit4 on 2017/6/20.
 */
const crypto = require('crypto');
const config = require('../hbuild.config');
const path = require('path');

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

function resolve(...pathname) {
    let buildDir ,pathArray = [];
    for(let name of pathname){
        buildDir = !config[name] ? name || '' : config[name];
        pathArray.push(buildDir)
    }
    return path.join(...pathArray);
}

module.exports = {
    util: util,
    resolve: resolve
}
