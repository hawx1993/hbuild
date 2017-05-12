/**
 * Created by trigkit4 on 2017/5/9.
 */
let config = require('./config');

let Api = {
    queryItemList: config.rootUrl + '/h5/promotion/buyershow.queryBuyerShowItemList/1.0',
    queryCommentList: config.rootUrl + '/h5/promotion/buyershow.queryItemCommentList/1.0'
};
export default Api;
