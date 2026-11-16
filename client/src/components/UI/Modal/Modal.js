import React, { Component } from 'react';

class Modal extends Component {

    render() {

        if( !this.props.show) {
            return <React.Fragment/>
        }

        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }

}

export default Modal;