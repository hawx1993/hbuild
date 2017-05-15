/**
 * Created by trigkit4 on 2017/5/11.
 */
{{#if_eq project 'h5'}}
import '../../common/css/common.less';
import './index.less';
import mainTpl from './tpl/main.tpl.html'

class Index {
    constructor() {
        this.mainContainer = $('#main');
        this.getList();
    }
    getList(){
        let data = {
            name: 'trigkti4',
            msg: 'welcome to  hbuild'
        }
        this.mainContainer.html(mainTpl({
            data: data
        }));
    }
}
new Index();
{{/if_eq}}

{{#if_eq project 'vue'}}

import Vue from 'vue'
import router from '../../components/router/router'
{{#vuex}}
import store from '../../components/store/store.js'
{{/vuex}}

let Index = {
    init () {
        let vm = new Vue({
            el: '#main',
            router: router{{#vuex}},
            store{{/vuex}}
        })
    }
};
Index.init();
{{/if_eq}}

