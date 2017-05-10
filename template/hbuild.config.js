/**
 * Created by trigkit4 on 2017/5/9.
 * 脚手架个性化配置文件
 */

module.exports = {
    //项目名称
    name: 'hbuild project',
    //本地服务器端口
    port: 3001,
    //hostname
    host: 'h5.dev.weidian.com',
    title: '{{ name }}',
    //编译输出目录
    outputPath: 'dist/',
    //
    dev: true,
    replace: {
        data: [
                {
                    name: 'vap_url',
                    value: function (args) {
                        if (args.environment == 0) {
                            return '/mock';
                        } else if (args.environment == 1) {
                            return '//vap.gw.daily.weidian.com';
                        } else if (args.environment == 2) {
                            return '//vap.gw.pre.weidian.com';
                        }
                        return '//vap.gw.weidian.com';
                    }
            }
        ]
    }
};
