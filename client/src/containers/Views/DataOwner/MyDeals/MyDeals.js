import React, { Component } from 'react';
import classes from './MyDeals.module.css';
import BoxModal from '../../../../components/UI/BoxModal/BoxModal';
import { NavLink } from 'react-router-dom';
import bs58 from 'bs58';
import ecies from "eth-ecies";

class MyDeals extends Component {

    state = {
        results: null,
        closedDealsList: null,
        loaded: false,
        displayBox: false,
        activeAttributeId: null,
        activeAttributeBuyer: null,
        iv: null,
        decryptionKey: null
    }

    componentDidMount = async () => {

        if (this.props.dataOwner) {
            let ownerList = await this.props.contract.getOwnerDatasetsList(this.props.accounts[0]);
            let ownerCount = await this.props.contract.getOwnerDatasetsCount(this.props.accounts[0]);
            ownerCount = ownerCount.toNumber();
            let dict = [];
            let dict2 = [];
            let dict3 = [];
            let pendingDeals = null;
            let withdrawalStatus = false;
            let alreadyWithdrawn = false;
            let withdrawalPeriod = null;
            let withdrawalCheckpointStart = null;
            let pwdStatus = null;
            let time = null;
            let price = null;
            let bytes32Hex = null;
            let hashHex = null;
            let hashBytes = null;
            let hashStr = null;

            withdrawalPeriod = await this.props.contract.getWithdrawalPeriod();
            time = await this.props.contract.getTime();

            for (let i = 0; i < ownerCount; i++) {
                pendingDeals = await this.props.contract.getOwnerTransactionsHistory(ownerList[i], this.props.accounts[0]);
                price = await this.props.contract.getDatasetPrice(ownerList[i]);
                // DECODE 32BYTES IPFS HASH TO BS58
                bytes32Hex = ownerList[i];
                hashHex = "1220" + bytes32Hex.slice(2);
                hashBytes = Buffer.from(hashHex, 'hex');
                hashStr = bs58.encode(hashBytes);

                dict2 = [];

                for (let j = 0; j < pendingDeals.length; j++){
                    withdrawalStatus = await this.props.contract.getWithdrawalStatus(pendingDeals[j], ownerList[i]);
                    alreadyWithdrawn = await this.props.contract.getTransactionWithdrawStatus(ownerList[i], pendingDeals[j], this.props.accounts[0] )
                    // WITHDRAWAL SPEEDBUMP.
                    withdrawalCheckpointStart = await this.props.contract.getWithdrawalCheckpointStartOwner(ownerList[i], pendingDeals[j], this.props.accounts[0]);
                    pwdStatus = await this.props.contract.getPasswordUploadStatus(pendingDeals[j], ownerList[i]);
                    console.log("withdrawalPeriod: ", withdrawalPeriod.toNumber());
                    console.log("withdrawalCheckpointStart: ", withdrawalCheckpointStart.toNumber());
                    console.log("time: ", time.toNumber());

                    if (alreadyWithdrawn !== true) {
                        dict2.push({
                            buyer: pendingDeals[j],
                            withdraw: withdrawalStatus,
                            withdrawalPeriod: withdrawalPeriod.toNumber(),
                            withdrawalCheckpointStart: withdrawalCheckpointStart.toNumber(),
                            pwdStatus: pwdStatus,
                            price: (price / Math.pow(10, 18)),
                            time: time.toNumber()
                        })
                    }

                    else {
                        dict3.push({
                            id: hashStr,
                            buyer: pendingDeals[j],
                            price: (price / Math.pow(10, 18))
                        })
                    }
                }
                
                if (pendingDeals.length !== 0) {
                    dict.push({
                        id: hashStr,
                        list: dict2
                    })
                }

            }

            this.setState({
                results: dict,
                closedDealsList: dict3,
                loaded: true
            });
        }
    }


    uploadDataHandler = (event, buyer, id) => {
        this.setState({ displayBox :  true, 
                        activeAttributeId : id, 
                        activeAttributeBuyer: buyer});
    }

    hideUploadDataHandler = (event) => {
            this.setState({ displayBox: false,
                            activeAttributeId : null });
    }

    changeIVHandler = (event) => {
        let newIV = event.target.value;
        this.setState({ iv : newIV });
    }

    changeDecryptionKeyHandler = (event) => {
        let newDecryptionKey = event.target.value;
        this.setState({ decryptionKey : newDecryptionKey });
    }

    submitNewKeys = async (event, buyer, id) => {
        // ASSYMETRIC ECIES ENCRYPTION
        const publicKey = await this.props.contract.getPublicKey(buyer);

        if (publicKey !== "") {
            // Submit the key and iv generated after dataset upload
            let iv = this.state.iv; // This must be the dataset symmetric pwd.
            let decryptionKey = this.state.decryptionKey;
            let bufferPublicKey = new Buffer(publicKey, 'hex');
            // Create buffer for key and iv
            let bufferIV = new Buffer(iv);
            let bufferDecryptionKey = new Buffer(decryptionKey);
            // And encrypt the data for both of them
            console.log("PuKey: ", publicKey);
            let encryptedIV = ecies.encrypt(bufferPublicKey, bufferIV).toString('base64');
            let encryptedKey = ecies.encrypt(bufferPublicKey, bufferDecryptionKey).toString('base64');
            // Transform datasetId (IPFS hash) into hex32bytes 
            let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
            // Finally upload to the blockchain the encrypted key and iv
            await this.props.contract.passwordUpload(buyer, id32bytes, encryptedIV, encryptedKey, { from: this.props.accounts[0] })
                .then(console.log("Password submitted"));
            alert("Password submitted");
        } else {
            alert("Invalid public key from buyer");
        }
    }

    withdrawHandler = async (event, buyer, id) => {
        let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
        await this.props.contract.withdrawTransactionBalance(buyer, id32bytes, { from: this.props.accounts[0] })
        .then(console.log("Balance withdrawn"));
        alert("Balance withdrawn");
    }

    render() {

        let showMyDeals = null;
        let closedDeals = null;

        if (this.state.loaded) {

            showMyDeals = (
                <div>
                    <h2> My Deals </h2>
                    <br/>
                    {this.state.results.map(element => {
                        return element.list.map(element2 => {
                            return (
                                <div>
                                    <article className={classes.SearchResults}>
                                        <div className={classes.Attributes}>
                                            <p className={classes.id}> id: {element.id} </p>
                                            <p className={classes.id}> Buyer: {element2.buyer} </p>
                                            <p className={classes.Price}> Price: {element2.price} ETH</p>
                                        </div>

                                        <div className={classes.ButtonDisplay}>
                                            <button onClick={(event) => this.uploadDataHandler(event, element2.buyer, element.id)}
                                                className={classes.ButtonStyle}> Upload keys </button>
                                            <button onClick={(event) => this.withdrawHandler(event, element2.buyer, element.id)}
                                                className={classes.ButtonStyle}> Withdraw </button>
                                        </div>

                                        <div className={classes.Display2}>
                                            <BoxModal show={this.state.displayBox}
                                                dataOwner={this.props.dataOwner}
                                                buyer={element2.buyer}
                                                id={element.id}
                                                activeAttributeId={this.state.activeAttributeId}
                                                activeAttributeBuyer={this.state.activeAttributeBuyer}>

                                                <input className={classes.InputElement}
                                                    onChange={(event) => this.changeDecryptionKeyHandler(event)}
                                                    value={this.state.decryptionKey}
                                                    type="password"
                                                    placeholder="Decryption key..." />
                                                <input className={classes.InputElement}
                                                    onChange={(event) => this.changeIVHandler(event)}
                                                    value={this.state.iv}
                                                    type="password"
                                                    placeholder="IV..." />
                                                <div className={classes.buttonDisplay}>
                                                    <button className={classes.ButtonStyle}
                                                        onClick={(event) => this.submitNewKeys(event, element2.buyer, element.id)}> Confirm </button>
                                                    <button className={classes.ButtonStyle}
                                                        onClick={(event) => this.hideUploadDataHandler(event, element2.buyer)}> Hide </button>
                                                </div>
                                            </BoxModal>
                                            <br />
                                            <div className={classes.Status}>
                                                {element2.withdraw === false ? 'Pending: Password confirmation by Buyer' : 'Withdrawal allowed.'}
                                                <br />
                                                {/* {element2.pwdStatus === true ? 'Time remaining to withdraw: ' + parseInt(((element2.withdrawalCheckpointStart - element2.time) + (element2.withdrawalPeriod)) / 3600) + 'hours' : "Withdraw disabled. Please upload the password."} */}
                                                {element2.pwdStatus === true ? 'Time remaining to withdraw: ' + parseInt(((element2.withdrawalCheckpointStart - element2.time) + (element2.withdrawalPeriod)) / 60) + ' mins' : "Withdraw disabled. Please upload the password."}
                                            </div>
                                        </div>
                                    </article>
                                </div>
                        
                        )

                    })})}
                    
                </div>

            );

            closedDeals = (
                <React.Fragment>
                    <h2> My closed deals: </h2>
                    {this.state.closedDealsList.map(element => {
                        return (
                            <div>
                                <article className={classes.SearchResults}>
                                    <div className={classes.Attributes}>
                                        <p> id: {element.id} </p>
                                        <p> Buyer: {element.buyer} </p>
                                        <p> Price: {element.price} ETH</p>
                                    </div>
                                </article>
                            </div>
                        )
                    })}

                    <div>
                        <NavLink to="/profile"
                                 className={classes.Back}
                                 exact > Back to profile
                        </NavLink>
                    </div>
                    <br/>
                </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                <div className={classes.Display}>
                    <section>
                        {showMyDeals}
                    </section>

                    <section>
                        {closedDeals}
                    </section>

                </div>
            </React.Fragment>
        )
    }
}

 
export default MyDeals;