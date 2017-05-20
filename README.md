
### 关于 Hbuild
    


Hbuild使用基于vue-cli的命令行工具，全局注册后可快速生成项目启动套件。你可以使用Hbuild生成一个h5项目，或者vue项目（默认搭配react-router，可自由选择vuex），或者react项目。该套件包含如下特点：
    
### Features
       
- Vue2 / Vue-Router / Vuex
- Hot reloading for single-file components
- Webpack 2 
- ES6
- LESS
- SASS
- React
- zepto
- autoprefixer
- mock server
- eslint
- Support for building multi-page applications
- offline mode support

其中zepto是默认全局引入的，可直接使用。h5项目默认引入ejs模板引擎。默认支持Babel转码。支持HMR
    
    
### Get Started
    
    
You'd better have node >=4 and npm >=3 and gulp >=3.9 installed:
    
```javascript
$ npm install -g vue-cli
$ vue init hawx1993/hbuild new-project
$ //当你本地环境生成Hbuild后，下次可直接使用：
$ //vue init ./hbuild new-project
$ cd new-project
$ npm install
 
# edit files and start developing
$ npm run dev
# bundle all scripts and styles for production use
$ npm run build
 
# lint your js code
$ npm run eslint
```
    

### Local Templates

when you download the template,you can also use a template on your local file system:

```javascript
$ vue init ./hbuild new-project
```

### 目录结构

```bash
.
├── README.md
├── gulpfile.js                 # gulp文件
├── hbuild.config.js            # 脚手架配置文件
├── mock                        # mock数据目录，保持和接口一样的路径即可
│   └── h5
├── package.json    
├── src                         # 源文件 
│   ├── assets                  # 静态资源目录，存放图片或字体
│   │   └── logo.ico
│   ├── common                  # 共用代码目录，css目录存放公用css部分，js同理
│   │   ├── css
│   │   │   ├── common.less
│   │   │   └── common.scss
│   │   └── js
│   │       ├── api.js          # api文件
│   │       ├── config.js       # 配置文件
│   │       └── util.js         # 工具函数文件，可将公用方法存放于此
│   ├── components              # 组件
│   │   ├── counter             # 计数器vue组件
│   │   │   └── index.vue
│   │   ├── index               # vue组件的入口文件
│   │   │   └── index.vue
│   │   ├── meta                # h5 meta头部信息模块
│   │   │   └── index.html
│   │   ├── router              # vue路由模块
│   │   │   └── router.js
│   │   └── store               # vuex store模块
│   │       └── store.js
│   ├── lib                     # 第三方库 
│   └── pages                   # 页面    
│       └── index               # 首页目录，可在pages目录下新建多个目录结构，作为多入口文件
│           ├── index.html
│           ├── index.js        # index.js/index.jsx文件为webpack的入口文件
│           ├── index.jsx
│           ├── index.less      # 样式文件在js文件中引入，可设置是否提取出css文件     
│           ├── index.scss
│           └── module          # 页面模板模块，可在index.js/jsx文件引入该模块文件
│               ├── main.jsx
│               └── main.tpl.html
├── webpack.config.js
└── yarn.lock
```

>说明：

- 支持多入口文件，可在pages下新建目录，文件名需以index开头

- 字符串替换：`$$_CDNPATH_$$`会被编译替换为`build/static`目录

- 脚手架默认会将项目编译文件输出到build目录，该目录包含pages和static目录。pages存放HTML文件，static存放js，css，图标，字体等静态资源文件。
- 当生成模板文件时，可以在本地修改该模板，使用`vue init ./hbuild new-project`即可在本地使用该模板文件

- 修改默认文件夹的名称，需要在`hbuild.config.js`文件就对应文件变量做修改


### hbuild.config.js

>样式配置

```javascript
//样式配置
    style: {
        extract: false,//是否提取css文件
        sourceMap: true,
        extractFileName: '[name].extract.css'//文件名
    },
```

提取css:
- 优点：可以单独缓存css文件，并行加载CSS文件，
- 缺点：没有热替换，会有额外的HTTP请求，以及更长的编译时间。

看大家取舍，默认是不提取。提取的话需要手动在HTML文件头部引入该文件。

提取CSS以及sourceMap功能只在非开发模式下进行。

extractFileName：提取的文件名，默认是`父级目录名.extract.css`，提取的文件与js文件目录一致

>文件变量

```
    src: 'src',
    lib:  'lib',
    assets: 'assets',
    common: 'common',
    pages:  'pages',
    components:'components',
    //编译输出目录
    buildPath: 'build',
    staticPath: 'static',
```
手动修改文件夹名称的，需要在该文件同步一下即可



### License
    
MIT © hawx1993
