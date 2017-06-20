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
    src: 'src',
    lib:  'lib',
    assets: 'assets',
    common: 'common',
    pages:  'pages',
    components:'components',
    //hostname
    host: 'localhost',
    //构建工具目录
    build: 'build',
    //编译输出目录
    buildPath: 'dist',
    staticPath: 'static',
    //图片字体等输出路径
    buildAssets: 'assets',
    //是否自动打开浏览器
    open: true,
    //sourceMap非开发模式有效
    sourceMap: true,
    //样式配置
    style: {
        extract: false,//是否提取css文件
        sourceMap: true,//非开发模式有效
        extractFileName: '[name].extract.css'//文件名
    },
    //需要根据环境替换的变量
    replacement: [
        {
            pattern: /\$\$_APIURL_\$\$/g,
            replace: function (args) {
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
        },
        {
            pattern: /\$\$_TESTURL_\$\$/g,
            replace: function (args) {
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
