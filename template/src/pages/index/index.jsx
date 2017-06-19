import React, {Component} from 'react';
import ReactDom from 'react-dom';
import HbuildRouterExample from './module/router';

class App extends Component {
    constructor() {
        super();
    }
    render() {
        return (
            <HbuildRouterExample/>
        );
    }
}
if (module.hot) { module.hot.accept(); }//热加载
ReactDom.render(<App />, document.querySelector('#main'));
