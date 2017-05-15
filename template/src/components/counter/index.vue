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

<script>
    export default {
        computed: {
            count() {
                return this.$store.state.count
            }
        }
    }
</script>

<style lang="less" rel="stylesheet/less">
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
