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
{{/if_eq}}
{{#if_eq preProcessor 'LESS'}}
<style lang="less" scoped>
{{/if_eq}}
</style>
<script>
    {{#vuex}}
    import Counter from 'components/counter/index'

    export default {
        data(){
            return {
                msg: 'hello,hbuild'
            }
        },
        components: {
            Counter
        }
    }
    {{/vuex}}
</script>
