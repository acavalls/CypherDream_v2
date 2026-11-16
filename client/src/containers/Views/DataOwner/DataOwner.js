import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './DataOwner.module.css';

class DataOwner extends Component {

    render() {

        return (
            <div>
                <h2> PERSONAL AREA: DATA OWNER </h2>

                <br />

                <div class="card">
                    <div class="card-header">
                        <h5>
                            <NavLink to="/profile/Forms"
                                     exact > UPLOAD DATASET
                            </NavLink>
                        </h5>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h5>
                            <NavLink to="/profile/MyDatasets"
                                     exact > MY DATASETS
                            </NavLink>
                        </h5>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h5>
                            <NavLink to="/profile/MyDeals"
                                     exact > MY DEALS
                            </NavLink>
                        </h5>
                    </div>
                </div>

            </div>

        );
      }
}

export default DataOwner; 




  
  
