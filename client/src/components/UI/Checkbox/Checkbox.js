import React from 'react';
import classes from './Checkbox.module.css';

const checkbox = (props) => {
    return (
    <React.Fragment>

        <input 
             className={classes.checkmark}
             type="checkbox"
             name="¿Allow partial matching?"
             checked={props.isChecked}
             onChange={props.clicked} />

    </React.Fragment>
    )
}

export default checkbox;