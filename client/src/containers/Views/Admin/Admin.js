import React, { Component } from 'react';
import classes from './Admin.module.css';
import Modal from '../../../components/UI/Modal/Modal'

class Admin extends Component {
    state = {
        dataOwnerRequestKV: [],
        addAdminAddress: null,
        removeAdminAddress: null,
        dataOwnerRequestAddress: "",
        removeDataOwnerAddress: null,
        index : null,
        selected: false,
        mkowner: false
    }

    componentDidMount = async () => {
        let data = await this.props.contract.getDataOwnerRequestStatusArray();
        let dict = [];
        for(let i=0; i<data.length; i++){
            dict.push({
                        id: i,
                        val: data[i]
            })  
        }

        let owner = await this.props.contract.checkMKOwnerStatus(this.props.accounts[0]);

        this.setState( { dataOwnerRequestKV : dict, mkowner: owner })
    }

    refreshRequestsArrayHandler = async (event) => {
        let data = await this.props.contract.getDataOwnerRequestStatusArray();
        let dict = [];
        for(let i=0; i<data.length; i++){
            dict.push({
                        id: i,
                        val: data[i]
            })  
        }

        this.setState( { dataOwnerRequestKV : dict,
                         dataOwnerRequestAddress : "" })
    }

    addAdminAddressHandler = (event) => {
        const address = event.target.value;
        this.setState( { addAdminAddress : address })
    }

    removeAdminAddressHandler = (event) => {
        const address = event.target.value;
        this.setState( { removeAdminAddress : address })
    }

    dataOwnerRequestAddressHandler = (event) => {
        const address = event.target.value;
        const keys = JSON.parse(address);
        const id = parseInt(keys["id"], 10);
        const add = keys["val"];
        
        this.setState( { dataOwnerRequestAddress : add, 
                         index : id, 
                         selected: true})
    }

    removeDataOwnerAddressHandler = (event) => {
        const address = event.target.value;
        this.setState( { removeDataOwnerAddress : address })
    }

    addAdminStatusHandler = async (event) => {
        this.props.contract.addAdmin(this.state.addAdminAddress, { from: this.props.accounts[0] })
            .then(console.log("admin status added"));
    }

    withdrawFeesHandler = async (event) => {
        this.props.contract.ownerWithdrawal({ from: this.props.accounts[0] })
            .then(console.log("fees withdrawn"));
    }

    removeAdminStatusHandler = async (event) => {
        this.props.contract.removeAdmin(this.state.removeAdminAddress, { from: this.props.accounts[0] })
            .then(console.log("admin status removed"));
    }

    acceptDataOwnerRequestHandler = async (event) => {   
        if (this.state.selected) {
            this.props.contract.addDataOwnerStatus(this.state.dataOwnerRequestAddress,
                                                   this.state.index,
                                                   { from: this.props.accounts[0] })
                .then( () => console.log("dataOwner status added"))
        }
        let newArr = [...this.state.dataOwnerRequestKV];
        newArr[this.state.index] = newArr[newArr.length-1];
        delete newArr[newArr.length-1];
        newArr.length--;
        this.setState({ dataOwnerRequestKV : newArr,
                        dataOwnerRequestAddress : "" });
    }

    rejectDataOwnerRequestHandler = async (event) => {
        if(this.state.selected) {
            this.props.contract.removeDataOwnerStatusRequest(this.state.index, { from: this.props.accounts[0] })
                .then( console.log("dataOwner status rejected"));
        }
        let newArr = [...this.state.dataOwnerRequestKV];
        newArr[this.state.index] = newArr[newArr.length-1];
        delete newArr[newArr.length-1];
        newArr.length--;
        this.setState({ dataOwnerRequestKV : newArr,
                        dataOwnerRequestAddress : "" });
    }

    removeDataOwnerStatusHandler = async (event) => {
        this.props.contract.removeDataOwnerStatus(this.state.removeDataOwnerAddress, { from: this.props.accounts[0] })
            .then(console.log("dataOwner status removed"));
    }

    render () {

        return (
            <React.Fragment>

                <h2> Admin Page: </h2>

                <br />

                <p className={classes.font}> Add an Admin: </p>

                <div>
                    <input className={classes.InputElement}
                        placeholder="Please type a valid address: 0x453439b...."
                        onChange={this.addAdminAddressHandler} />

                    <div>
                        <button className={classes.Button}
                            onClick={this.addAdminStatusHandler}> Add </button>
                    </div>
                </div>

                <br />

                <p className={classes.font}> Remove an Admin: </p>

                <div>
                    <input className={classes.InputElement}
                        placeholder="Please type a valid address: 0x453439b...."
                        onChange={this.removeAdminAddressHandler} />
                    <div>
                        <button className={classes.Button}
                            onClick={this.removeAdminStatusHandler}> Remove </button>
                    </div>
                </div>

                <br />

                <p className={classes.font}> Data Owner request: </p>

                <div>

                    <select
                        className={classes.InputElement}
                        value={this.state.dataOwnerRequestAddress}
                        onChange={(event) => this.dataOwnerRequestAddressHandler(event)}>
                        <option value="" disabled>Choose here</option>

                        {this.state.dataOwnerRequestKV.map((option) => (
                            <option value={"{\"val\" : " + "\"" + option.val + "\""
                                + "," + "\"id\" : " + "\"" + option.id + "\"}"}>
                                {option.val}
                            </option>
                        ))}

                    </select>

                    <div>
                        <button className={classes.Button}
                            onClick={(event) => this.acceptDataOwnerRequestHandler(event)}> ¿OK? </button>
                        <button className={classes.Button}
                            onClick={(event) => this.rejectDataOwnerRequestHandler(event)}> Reject </button>
                        <div className={classes.Refresh}
                            onClick={this.refreshRequestsArrayHandler}> Refresh list.
                        </div>
                    </div>
                </div>

                <br />

                <p className={classes.font}> Remove a Data Owner: </p>

                <div>

                    <input className={classes.InputElement}
                        placeholder="Please type a valid address: 0x453439b...."
                        onChange={this.removeDataOwnerAddressHandler} />

                    <div>
                        <button className={classes.Button}
                            onClick={this.removeDataOwnerStatusHandler}> Remove </button>
                    </div>
                </div>

                <br />

                <Modal show={this.state.mkowner}>
                    <p className={classes.font}> Withdraw contract fees: </p>

                    <div>
                        <button className={classes.Button}
                            onClick={this.withdrawFeesHandler}> Withdraw </button>
                    </div>

                    <br />
                </Modal>

            </React.Fragment>
            
        );
    }
}

export default Admin;