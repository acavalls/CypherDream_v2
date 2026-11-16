import React, { Component } from 'react';

class BoxModal extends Component {

    render() {

        if (!this.props.show) {
            return <React.Fragment />
        }

        if (this.props.id !== this.props.activeAttributeId) {
            return <React.Fragment />
        }

        if(this.props.dataOwner && this.props.buyer !== this.props.activeAttributeBuyer){
            return <React.Fragment />
        }

        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )

    }

}

export default BoxModal;