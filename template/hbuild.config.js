/**
 * Created by trigkit4 on 2017/5/9.
 * 脚手架个性化配置文件
 *
 */
module.exports = {
    //项目名称
    name: '{{ name }}',
    //本地服务器端口
    port: 3001,
    //文件目录
    '': '',
    src: 'src',
    lib:  'lib',
    assets: 'assets',
    common: 'common',
    pages:  'pages',
    components:'components',
    //hostname
    host: 'http://h5.dev.weidian.com',
    //编译输出目录
    buildPath: 'build',
    staticPath: 'static',
    //
    sourceMap: true,
    //样式配置
    style: {
        extract: false,//是否提取css文件
        sourceMap: true,
        extractFileName: '[name].extract.css'//文件名
    },
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
