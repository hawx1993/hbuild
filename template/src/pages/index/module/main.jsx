import React from 'react';

class Contacts extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        console.log(this); // React Component instance
    }
    render() {
        const styles = {
            width: '100px',
            height: '20px',
            border: '1px solid #ccc'
        };
        return (
            <div onClick={this.handleClick} style={styles}>hello ,hbuild</div>
        );
    }
}

export default Contacts;
