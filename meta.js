/**
 * Created by trigkit4 on 17/6/29.
 */
module.exports = {
    template: 'handlebars',
    templateOptions: {
        helpers: {
            'if_eq': function (a,b,opts) {
                return a === b
                    ? opts.fn(this)
                    : opts.inverse(this)
            },
            'unless_eq': function (a, b, opts) {
                return a === b
                    ? opts.inverse(this)
                    : opts.fn(this)
            }
        }
    },
    prompts:{
        "name":{
            "type": "string",
            "required": true,
            "message": "Your Project Name"
        },
        "description":{
            "type": "string",
            "required": false,
            "message": "Project description",
            "default": "build  project starter kit rapidly by hbuild"
        },
        "author":{
            "type": "string",
            "message": "Author"
        },
        "project": {
            "type": "list",
            "message": "select your project type",
            "choices": ["h5","vue","react"]
        },
        "template": {
            "when": "project =='h5'",
            "type": "list",
            "message": "select your template engine",
            "choices": ["ejs","mustache","art-template"]
        },
        "vuex": {
            "when": "project=='vue'",
            "type": "confirm",
            "message": "use vuex in your project",
            "default": true
        },
        "preprocessor": {
            "type": "list",
            "message": "select one css pre-processor",
            "choices": ["LESS","SASS","stylus"]
        }
    },
    "filters": {
        "src/pages/index/module/*.html": "project == 'h5' && template !== 'art-template'",
        "src/pages/index/module/*.art": "project == 'h5' &&  template == 'art-template'",
        "src/pages/index/*.jsx": "project == 'react'",
        "src/pages/index/*.js": "project !=='react'",
        "src/pages/index/module/*.jsx": "project == 'react'",
        "src/pages/index/*.styl": "preprocessor =='stylus' && project =='h5'",
        "src/pages/index/*.less": "preprocessor == 'LESS' && project == 'h5'",
        "src/pages/index/*.scss": "preprocessor == 'SASS' && project == 'h5'",
        "src/components/index/*.vue": "project == 'vue'",
        "src/components/router/*.js": "project == 'vue'",
        "src/components/counter/*.vue": "project == 'vue' && vuex",
        "src/components/store/*.js": "project == 'vue' && vuex",
        "src/common/css/*.less": "preprocessor == 'LESS'",
        "src/common/css/*.scss": "preprocessor == 'SASS'",
        "src/common/css/*.styl": "preprocessor == 'stylus'",
        "src/lib/media.less": "preprocessor == 'LESS' ",
        "src/lib/media.scss": "preprocessor == 'SASS' ",
        "src/lib/media.styl": "preprocessor == 'stylus' "
    },
    post({log, folderName, chalk}) {
        log.success(`Your new project has been successfully generated in ${chalk.underline(folderName)}!`)
        console.log(chalk.bold(`  To get started:\n`))
        console.log(`  cd ${folderName}`)
        console.log(`  yarn`)
        console.log(`  npm  run  dev\n`)
        console.log(chalk.bold(`  To build for production:\n`))
        console.log(`  npm  run  prod\n`)
    }
}