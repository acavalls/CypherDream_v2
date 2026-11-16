import React from 'react';
import classes from './Input.module.css';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';

const input = ( props ) => {
    let inputElement = null;

    switch ( props.elementType ) {
        case ( 'input' ):
            inputElement = <input
                className={classes.InputElement}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed} />;
            break;
        case ( 'input-address' ):
            inputElement = <input
                className={classes.InputElement}
                {...props.elementConfig}
                value={props.value}
                disabled />;
            break;
        case ( 'textarea' ):
            inputElement = <textarea
                className={classes.InputElement}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed} />;
            break;
        case ( 'select' ):
            inputElement = (
                <select
                    className={classes.InputElement}
                    value={props.value}
                    onChange={props.changed}>
                    <option value="" disabled>Choose here</option>
                    {props.elementConfig.options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.displayValue}
                        </option>
                    ))}
                </select>
            );
            break;
        default:
            inputElement = <input
                className={classes.InputElement}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed} />;
    }

    let buttons = null;

    if(props.individual) {
        buttons = (
            <React.Fragment>
                (
                <Button clicked={props.display}> + </Button>
                /
                <Button clicked={props.hide}> - </Button>
                )
            </React.Fragment>
        )
    }
    return (
        <div className={classes.Input}>
            <label className={classes.Label}>
                {props.label + ' '} 
                {buttons}
            </label>
            <Modal show={props.displayBox}>
                {inputElement}
            </Modal>
        </div>
    );

};

export default input;