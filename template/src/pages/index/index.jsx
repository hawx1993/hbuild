import React, {Component} from 'react';
import ReactDom from 'react-dom';


class App extends Component {
    constructor() {
        super();
        this.state = {
            name: "copyright @trigkit4"
        };
    }
    render() {
        return (
            <div className="center-box">
                <div>hello,hbuild :: {this.state.name}</div>
                <p>build for react demo</p>
            </div>
        );
    }
}
ReactDom.render(<App />, document.querySelector('#main'));
