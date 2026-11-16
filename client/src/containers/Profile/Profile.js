import React, { Component } from 'react';
import classes from './Profile.module.css';
import Admin from '../../containers/Views/Admin/Admin';
import Buyer from '../../containers/Views/Buyer/Buyer';
import DataOwner from '../../containers/Views/DataOwner/DataOwner';

class Profile extends Component {

    render() {

        let message = null;

        if(this.props.admin) {
            message = ( <div> 
                            <Admin contract={this.props.contract}
                                   accounts={this.props.accounts} />
                        </div> )
        }

        if(this.props.dataOwner) {
            message = ( <div> 
                            <DataOwner contract={this.props.contract}
                                       accounts={this.props.accounts} />
                        </div> )
        }

        if(this.props.buyer) {
            message = ( <div> 
                            <Buyer contract={this.props.contract}
                                   accounts={this.props.accounts} />
                        </div> )
        }
        

        return (
            <div className={classes.Profile}>
                {message}
            </div>
        )}
    }
                
export default Profile;