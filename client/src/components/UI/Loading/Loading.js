import React from 'react';

import classes from './Loading.module.css';

const spinner = () => (
    <div className={classes.Loader}> 
        <div className={classes.Text}> Loading... </div> 
    </div>
);

export default spinner;