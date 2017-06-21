/**
 * Created by trigkit4 on 2017/5/11.
 */
{{#if_eq project 'h5'}}
{{#if_eq preprocessor 'LESS'}}
import 'common/css/common.less';
import './index.less';
{{/if_eq}}
{{#if_eq preprocessor 'SASS'}}
import 'common/css/common.scss';
import './index.scss';
{{/if_eq}}
{{#if_eq preprocessor 'stylus'}}
import 'common/css/common.styl';
import './index.styl';
{{/if_eq}}
import mainTpl from './module/main.tpl.html'
import util from '../../common/js/util';
import Api from '../../common/js/api';

class Index {
    constructor() {
        this.mainContainer = $('#main');
        this.getList();
    }
    getList(){
        util.ajax({
            url: Api.queryItemList
        },(data)=>{
            let items = data.result.items;
            this.mainContainer.html(mainTpl({
                data: items
            }));
        })
    }
}
new Index();
{{/if_eq}}

{{#if_eq project 'vue'}}

import Vue from 'vue'
import router from 'components/router/router'
{{#vuex}}
import store from 'components/store/store.js'
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

