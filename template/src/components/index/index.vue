<template>
    <div class="page">
        <p>\{{ msg }}</p>
        {{#vuex}}
        <counter></counter>
        {{/vuex}}
        <p>copyright reserved by \{{ items.userName}}</p>
    </div>
</template>
{{#if_eq preprocessor 'SASS'}}
<style lang="scss" scoped>
    .page{
        text-align: center;
        font-size: 20px;
    }
</style>{{/if_eq}}{{#if_eq preprocessor 'LESS'}}
<style lang="less" scoped>
    .page{
        text-align: center;
        font-size: 20px;
    }
</style>
{{/if_eq}}{{#if_eq preprocessor 'stylus'}}
<style lang="stylus" scoped>
    .page
      text-align center
      font-size 20px
</style>
{{/if_eq}}

<script>
    {{#vuex}}
    import Counter from 'components/counter/index.vue'{{/vuex}}
    import util from 'common/js/util'
    import Api from 'common/js/api'
    export default {
        data(){
            return {
                msg: 'hello,hbuild',
                items: {}
            }
        },
        mounted(){
            let that = this;
            util.ajax({
                url: Api.queryItemList
            },(data)=>{
                let items = data.result.items;
                that.items = items;
            })
        }
        {{#vuex}},
        components: {
            Counter
        }{{/vuex}}
    }
</script>
