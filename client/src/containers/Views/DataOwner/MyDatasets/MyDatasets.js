import React, { Component } from 'react';
import classes from './MyDatasets.module.css';
import BoxModal from '../../../../components/UI/BoxModal/BoxModal';
import { NavLink } from 'react-router-dom';
import bs58 from 'bs58';
import { BigNumber } from 'bignumber.js';

class MyDatasets extends Component {

    state = {
        ownerList : null,
        ownerCount : null,
        loaded: false,
        displayBox: false,
        newPrice: null,
        activeAttributeId: null,
        results: null
    }

    componentDidMount = async () => {
        if(this.props.dataOwner){
            let ownerList = await this.props.contract.getOwnerDatasetsList(this.props.accounts[0]);
            let ownerCount = await this.props.contract.getOwnerDatasetsCount(this.props.accounts[0]);
            ownerCount = ownerCount.toNumber();
            let dict = [];
            let price = null;
            let bytes32Hex = null;
            let hashHex = null;
            let hashBytes = null;
            let hashStr = null;

            for(let i=0; i<ownerCount; i++){
                price = await this.props.contract.getDatasetPrice(ownerList[i]);
                // DECODE 32BYTES IPFS HASH TO BS58
                bytes32Hex = ownerList[i];
                hashHex = "1220" + bytes32Hex.slice(2);
                hashBytes = Buffer.from(hashHex, 'hex');
                hashStr = bs58.encode(hashBytes);
                

                dict.push({
                            id: hashStr,
                            Price: (price / Math.pow(10, 18))
                });
            }


            this.setState({
                ownerList: ownerList,
                ownerCount: ownerCount,
                results: dict,
                loaded: true
            });
        }
    }

    displayChangePriceHandler = (event, id) => {
        this.setState({ displayBox :  true, 
                        activeAttributeId : id });
    }

    hideChangePriceHandler = (event) => {
            this.setState({ displayBox: false,
                            activeAttributeId : null });
    }

    changePriceHandler = (event) => {
        let newPrice = event.target.value;
        this.setState({ newPrice : newPrice });
    }

    submitNewPrice = async (event, id) => {
        let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
        let newPrice = new BigNumber(Math.pow(10, 18) * this.state.newPrice);
        await this.props.contract.updateDatasetPrice(id32bytes, newPrice, { from: this.props.accounts[0] })
        .then(console.log("Price updated"));
        alert("Price updated");
    }

    removeDatasetHandler = async (event, id) => {
        console.log(id);
        let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
        console.log(id32bytes);
        await this.props.contract.removeDataset(id32bytes, { from: this.props.accounts[0] })
        .then(console.log("Dataset removed"));
        alert("Dataset removed");
    }

    render() {

        let showMyData = null;

        if(this.state.loaded) {
            
            showMyData = (
                <div className={classes.Layout}>
                    <h2> My Datasets </h2>
                    <br/>
                {this.state.results.map(element => {
                    return (
                        <div>
                            <article className={classes.SearchResults}>
                                <div className={classes.Attributes}>
                                    <p className={classes.id}> id: {element.id} </p>
                                    <p className={classes.Price}> Price: {element.Price} ETH </p>
                                </div>

                                <div className={classes.ButtonDisplay}>
                                    <button onClick={(event) => this.removeDatasetHandler(event, element.id)}
                                        className={classes.ButtonStyle}> Remove dataset </button>
                                    <button onClick={(event) => this.displayChangePriceHandler(event, element.id)}
                                        className={classes.ButtonStyle}> Change price </button>
                                </div>
                                <BoxModal show={this.state.displayBox}
                                    id={element.id}
                                    activeAttributeId={this.state.activeAttributeId}>
                                    <div className={classes.modalBlock}>
                                    <input className={classes.InputElement}
                                        onChange={(event) => this.changePriceHandler(event)}
                                        value={this.state.newPrice}
                                        type="text"
                                        placeholder="New price..." />
                                    <button className={classes.ButtonStyle}
                                        onClick={(event) => this.submitNewPrice(event, element.id)}> Confirm </button>
                                    <button className={classes.ButtonStyle}
                                        onClick={(event) => this.hideChangePriceHandler(event, element.id)}> Hide </button>
                                    </div>
                                </BoxModal>
                            </article>
                        </div>
                    )

                })}
                    <div className={classes.blockDisplay}> Total Datasets: {this.state.ownerCount} </div>
                    <br/>
                    <div>
                        <NavLink to="/profile"
                                 className={classes.Back}
                                 exact > Back to profile
                        </NavLink>
                    </div>
                    <br/>

                </div>

            );
        }
        

        return (
            <React.Fragment>
            <div className={classes.Display}>
               {showMyData}
            </div>
            </React.Fragment>
        )}
    }
 
export default MyDatasets;