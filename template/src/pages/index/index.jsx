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
ReactDom.render(<App />, document.querySelector('#main'));
