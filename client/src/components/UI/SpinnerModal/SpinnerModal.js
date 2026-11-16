import React, { Component } from 'react';
import classes from './SpinnerModal.module.css';
import Backdrop from '../Backdrop/Backdrop';

class SpinnerModal extends Component {

    render() {
        return (
            <React.Fragment>
                <Backdrop show={this.props.show}/>
                <div
                    className={classes.Modal}
                    style={{ opacity: this.props.show ? '1' : '0' }}>
                    {this.props.children}
                </div>
            </React.Fragment>
        )
    }

}

export default SpinnerModal;
