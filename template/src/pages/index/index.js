/**
 * Created by trigkit4 on 2017/5/11.
 */
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

