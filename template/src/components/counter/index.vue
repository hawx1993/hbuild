<template>
    <div class="counter-wrapper">
        <div class="counter">
            \{{ count }}
        </div>
        <div class="btn">
            <button @click="$store.commit('INCREMENT')">Increment</button>
            <button @click="$store.commit('DECREMENT')">Decrement</button>
        </div>
    </div>
</template>
{{#if_eq preprocessor 'LESS'}}
<style lang="less" rel="stylesheet/less" scoped>
    .counter-wrapper{
        .counter {
            margin: 100px auto;
            border-radius: 3px;
            width: 200px;
            height: 200px;
            text-align: center;
            line-height: 200px;
            font-size: 5rem;
            background-color: #f0f0f0;
            user-select: none;
        }
        .btn{
            margin: 0 auto;
            display: table;
            button{
                margin-left: 10px;
            }
        }
    }
</style>
{{/if_eq}}

{{#if_eq preprocessor 'SASS'}}
<style lang="scss" scoped>
    .counter-wrapper{
        .counter {
            margin: 100px auto;
            border-radius: 3px;
            width: 200px;
            height: 200px;
            text-align: center;
            line-height: 200px;
            font-size: 5rem;
            background-color: #f0f0f0;
            user-select: none;
        }
        .btn{
            margin: 0 auto;
            display: table;
            button{
                margin-left: 10px;
            }
        }
    }
</style>
{{/if_eq}}
{{#if_eq preprocessor 'stylus'}}
<style lang="stylus" scoped>
    .counter-wrapper
      .counter
        margin 100px auto
        border-radius 3px
        width 200px
        height 200px
        text-align center
        line-height 200px
        font-size 5rem
        background-color #f0f0f0
        user-select none
      .btn
        margin 0 auto
        display table
        button
          margin-left 10px
</style>
{{/if_eq}}
<script>
    export default {
        computed: {
            count() {
                return this.$store.state.count
            }
        }
    }
</script>

