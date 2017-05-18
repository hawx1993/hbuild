/**
 * Created by trigkit4 on 2017/5/9.
 * 脚手架个性化配置文件
 *
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
    outputPath: 'build/',
    staticPath: 'build/static',
    //需要根据环境替换的变量
    replacements: [
        {
            pattern: '/\$\$_APIURL_\$\$/ig',
            replacement: function (args) {
                if(args.environment ===0){
                    return '/mock'
                    //日常
                }else if(args.environment ===1){
                    return '//host.daily.domain.com'
                    //预发
                }else if(args.environment ===2){
                    return '//host.pre.domain.com'
                    //线上
                }else if(args.environment ===3){
                    return '//host.domain.com'
                }
            }
        }
    ]
};
