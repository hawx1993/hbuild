/**
 * Created by trigkit4 on 2017/5/15.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    count: 0
}

const mutations = {
    INCREMENT (state) {
        state.count++
    },
    DECREMENT (state) {
        state.count--
    }
}


const store = new Vuex.Store({
    state,
    mutations
})

export default store
