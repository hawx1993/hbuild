
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

其中zepto是默认全局引入的，可直接使用。默认支持Babel转码。支持HMR
    
    
### Get Started
    
    
You'd better have node >=4 and npm >=3 installed:
    
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
 
# lint your code
$ npm run lint
```
    
### 目录结构


- mock：mock数据目录，保持和接口一样的路径即可
- assets：静态资源目录，存放图片或字体
- common：共用代码目录，css目录存放公用css部分，js同理
- common/js/api.js：存放api的文件
- common/js/config：一些配置
- common/js/util：工具文件，可将公用方法存放于此
- components：组件库
- components/counter：计数器vue组件
- components/index：vue组件的入口文件
- components/meta：h5页面的meta信息模块
- components/router：vue的路由文件
- components/store：vuex的store文件
- lib：第三方库文件
- pages：页面入口，webpack默认会将该目录下的index.js/index.jsx文件作为入口文件
- pages/index：页面的index目录，可在pages目录下新建多个目录结构，多个不同页面需要新建多个不同目录
- pages/index/module：该目录下的文件可作为index目录文件的模块或模板文件
- `hbuild.config.js：脚手架配置文件，可自定义变量替换，输出路径，端口，地址，项目名称等等`

>说明：

- 支持多入口文件，可在pages下新建目录，文件名需以index开头

- 字符串替换：`$$_CDNPATH_$$`会被编译替换为`build/static`目录

- 脚手架默认会将项目编译文件输出到build目录，该目录包含pages和static目录。pages存放HTML文件，static存放js，css，图标，字体等静态资源文件。
- 当你生成模板文件时，可以在本地修改该模板，使用`vue init ./hbuild new-project`即可使用你自定义的模板文件


### License
    
MIT © hawx1993



###目录结构

```bash
├── README.md					#自述文件

├── gulpfile.js					#gulp文件

├── hbuild.config.js			#脚手架配置文件

├── mock						#mock数据文件

│   └── h5

├── package.json			

├── src							#源文件

│   ├── assets					#静态资源

│   │   └── logo.ico			#图标

│   ├── common					#共用代码

│   │   ├── css					#共用css

│   │   │   ├── common.less

│   │   │   └── common.scss

│   │   └── js					#共用js

│   │       ├── api.js			#接口文件

│   │       ├── config.js		#配置文件

│   │       └── util.js			#工具函数文件

│   ├── components				#组件

│   │   ├── counter				#vue计数器组件

│   │   │   └── index.vue

│   │   ├── index				#vue首页

│   │   │   └── index.vue

│   │   ├── meta				#H5页面meta部分

│   │   │   └── index.html

│   │   ├── router				#vue路由

│   │   │   └── router.js

│   │   └── store				#vuex store文件

│   │       └── store.js

│   ├── lib						#第三方库

│   └── pages					#页面结构

│       └── index				#首页

│           ├── index.html

│           ├── index.js

│           ├── index.less

│           ├── index.scss

│           └── tpl				#h5页面的模板部分

│               └── main.tpl.html

├── webpack.config.js			#webpack配置文件		

└── yarn.lock					#yarn文件
```
