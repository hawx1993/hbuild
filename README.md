### About Hbuild
    
  Hbuild is a modern web development started kit for rapid  build web applications,'h' means hybrid
    
### Features
    
  Hbuild is a modern started kit,which can build h5 applications ,vue applications and react applications , which has many features below:
    
- Vue2 / Vue-Router / Vuex
- Hot reloading for single-file components
- Webpack 2 
- ES6
- LESS
- React
- zepto for h5
- autoprefixer
- mock server
    
### Document

[中文文档]('./docs/start.md')
    
### Get Started
    
    
You'd better have node >=4 and npm >=3 installed:
    
```javascript
$ npm install -g vue-cli
$ vue init hawx1993/hbuild new-project
$ //if you download template,you can use it in your local environment
$ //vue init ./hbuild new-project //make sure you are in root directory
$ cd new-project
$ npm install || yarn
 
# edit files and start developing
$ npm run dev
# bundle all scripts and styles for production use
$ npm run build
 
# lint your code
$ npm run lint
```
    
### License
    
MIT © hawx1993


###目录结构

```
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
