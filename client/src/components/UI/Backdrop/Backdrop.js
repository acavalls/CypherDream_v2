import React, { Component } from 'react';
import classes from './Backdrop.module.css';

class Backdrop extends Component {
    render() {
        if (this.props.show) {
            return <div className={classes.Backdrop} />
        }
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}

export default Backdrop;