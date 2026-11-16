import React from 'react';

import classes from './SearchResults.module.css';

const searchResults = (props) => (

    <article className={classes.SearchResults}>

        <div> 

            <div className={classes.Attributes}>
                <p> id: {props.id} </p>
                <p> Address: {props.address} </p>
                
            </div>

            <div className={classes.Buy}> 
                <h3> <strong> Price: {props.price} ETH </strong>  </h3>
                <button className={classes.Button} onClick={props.clicked}> <strong> Buy </strong> </button>
            </div>
            
        </div>
        
    </article>
);

export default searchResults;