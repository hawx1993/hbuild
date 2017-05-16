<template>
    <div class="page">
        <p>\{{ msg }}</p>
        {{#vuex}}
        <counter></counter>
        {{/vuex}}
    </div>
</template>
{{#if_eq preProcessor 'SASS'}}
<style lang="scss" scoped>
    .page{
        text-align: center;
        font-size: 20px;
    }
</style>
{{/if_eq}}
{{#if_eq preProcessor 'LESS'}}
<style lang="less" scoped>
    .page{
        text-align: center;
        font-size: 20px;
    }
</style>
{{/if_eq}}

<script>
    {{#vuex}}
    import Counter from '../counter/index.vue'
    {{/vuex}}
    export default {
        data(){
            return {
                msg: 'hello,hbuild'
            }
        }{{#vuex}},
        components: {
            Counter
        }{{/vuex}}
    }
</script>
