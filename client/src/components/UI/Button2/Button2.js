import React from 'react';

import classes from './Button2.module.css';

const button = ( props ) => {

    return (
        <div className={classes.Button} onClick={props.clicked}>
            {props.children}
        </div>
    );

};

export default button;