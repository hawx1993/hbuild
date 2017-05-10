/**
 * Created by trigkit4 on 2017/5/10.
 */
// import Vue  from 'vue'
import Index from '../index/index.vue'
import VueRouter from 'vue-router';


Vue.use(VueRouter);

const routes = [{
    name: 'index',
    path: '/index',
    component: Index
},{
    path: '*',
    component: Index
}];
const router = new VueRouter({
    routes: routes
});
export default router;

