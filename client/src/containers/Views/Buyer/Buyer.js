import React, { Component } from 'react';
import classes from './Buyer.module.css';
import bs58 from 'bs58';
import ecies from "eth-ecies";
import BoxModal from '../../../components/UI/BoxModal/BoxModal';
import Modal from '../../../components/UI/Modal/Modal';
import { ipfs } from '../../../ipfs';
import Spinner from '../../../components/UI/Spinner/Spinner';
import SpinnerModal from '../../../components/UI/SpinnerModal/SpinnerModal';
import Enigma from '@cubbit/enigma';
import streamSaver from 'streamsaver/StreamSaver';
require('screw-filereader');
var str2ab = require('string-to-arraybuffer')
const { Transform, Readable } = require('stream');


class Buyer extends Component {

    state = {
        results : 0,
        loaded: false,
        totalDS: 0,
        closedDealsList: 0,
        displayBox: false,
        activeAttributeId: null,
        pk : null,
        decryptedIV: null,
        decryptedKey: null,
        dataFile: null,
        msg: "Decrypting your file. Please wait..",
        decrypting: false,
        invalid: false
    }

    componentDidMount = async () => {

        let buyerIdList = await this.props.contract.getBuyerDatasetsList(this.props.accounts[0]);
        let buyerCount = await this.props.contract.getBuyerDatasetsCount(this.props.accounts[0]);
        buyerCount = buyerCount.toNumber();
        let dict = [];
        let dict2 = [];
        let ownerAddress = null;
        let pwdStatus = false;
        let withdrawalStatus = false;
        let withdrawalPeriod = null;
        let withdrawalCheckpointStart = null;
        let time = null;
        let price = null;
        let bytes32Hex = null;
        let hashHex = null;
        let hashBytes = null;
        let hashStr = null;

        withdrawalPeriod = await this.props.contract.getWithdrawalPeriod();
        time = await this.props.contract.getTime();

        for (let i = 0; i < buyerCount; i++) {
            ownerAddress = await this.props.contract.getBuyerTransactionsHistory(buyerIdList[i], this.props.accounts[0]);
            pwdStatus = await this.props.contract.getPasswordUploadStatus(this.props.accounts[0], buyerIdList[i]);
            withdrawalStatus = await this.props.contract.getWithdrawalStatus(this.props.accounts[0], buyerIdList[i])
            withdrawalCheckpointStart = await this.props.contract.getWithdrawalCheckpointStartBuyer(buyerIdList[i], this.props.accounts[0], ownerAddress );
            price = await this.props.contract.getDatasetPrice(buyerIdList[i]);

            // DECODE 32BYTES IPFS HASH TO BS58
            bytes32Hex = buyerIdList[i];
            hashHex = "1220" + bytes32Hex.slice(2);
            hashBytes = Buffer.from(hashHex, 'hex');
            hashStr = bs58.encode(hashBytes);

            /*console.log("withdrawalPeriod: ", withdrawalPeriod.toNumber());
            console.log("withdrawalCheckpointStart: ", withdrawalCheckpointStart.toNumber());
            console.log("time: ", time.toNumber());*/

            if (withdrawalStatus === false) {
                dict.push({
                    id: hashStr,
                    owner: ownerAddress,
                    withdrawalPeriod: withdrawalPeriod.toNumber(),
                    withdrawalCheckpointStart : withdrawalCheckpointStart.toNumber(),
                    time: time.toNumber(),
                    pwdStatus: pwdStatus,
                    price: (price / Math.pow(10, 18))
                })
            }

            else {

                dict2.push({
                    id: hashStr,
                    owner: ownerAddress,
                    price: (price / Math.pow(10, 18))
                })

            }
        }
        
        this.setState({
            results: dict,
            loaded: true,
            totalDS: buyerCount,
            closedDealsList: dict2
        });
    }

    requestDataOwnerStatus =  async (event) => {
        this.props.contract.requestDataOwnerStatus({ from: this.props.accounts[0] })
        .then(console.log("dataOwner status requested"));
    }

    recoverAmountHandler = async (event, owner, id) => {
        let id32bytes = "0x"+bs58.decode(id).slice(2).toString('hex');
        await this.props.contract.recoverTransactionBalance(owner, id32bytes, { from: this.props.accounts[0] })
        .then(console.log("Recover request: Done"));
        alert("Recover request: Done");
    }

    rejectPasswordHandler = async (event, id) => {
        let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
        await this.props.contract.rejectPassword(id32bytes, { from: this.props.accounts[0] });
        alert("Password status reverted: Done");
    }

    allowWithdrawHandler = async (event, id, pwdStatus) => {
        if(pwdStatus === true) {
            let id32bytes = "0x" + bs58.decode(id).slice(2).toString('hex');
            await this.props.contract.allowWithdrawal(id32bytes, { from: this.props.accounts[0] })
                .then(console.log("Withdrawn allowed"));
            alert("Withdrawn allowed");
        }
    }

    showDecryptDataBox = (event, id, pwdStatus) => {
        if(pwdStatus) {
        this.setState({ displayBox :  true, 
                        activeAttributeId : id });
        }
    }

    hideDecryptDataBox = (event) => {
            this.setState({ displayBox: false,
                            activeAttributeId : null });
    }

    privateKeyHandler = async (event, id) => {
        let pk = event.target.value;
        this.setState({ privateKey : pk });
    }

    submitPrivateKey = async (event, id) => {
        let id32bytes = "0x"+bs58.decode(id).slice(2).toString('hex');
        let encryptedIV = await this.props.contract.getEncryptedIV(this.props.accounts[0], id32bytes);
        let encryptedKey = await this.props.contract.getEncryptedKey(this.props.accounts[0], id32bytes);
        let userPrivateKey = new Buffer(this.state.privateKey, 'hex');
        let bufferEncryptedIV = new Buffer(encryptedIV, 'base64');
        let bufferEncryptedKey = new Buffer(encryptedKey, 'base64');
        try {
            let decryptedIV = ecies.decrypt(userPrivateKey, bufferEncryptedIV).toString('utf8');
            let decryptedKey = ecies.decrypt(userPrivateKey, bufferEncryptedKey).toString('utf8');
            decryptedKey = Uint8Array.from(Buffer.from(decryptedKey, 'hex'));
            decryptedIV = Uint8Array.from(Buffer.from(decryptedIV, 'hex'));

            this.setState({ decryptedIV: decryptedIV,
                decryptedKey: decryptedKey,
                privateKey: null });
            alert("Private key submitted");
        } catch (err) {
            alert("Invalid private key");
        }
    }

    getFileFromIPFS = async (event, id) => {

        if (this.state.decryptedIV && this.state.decryptedKey) {

            this.setState({ decrypting: true, invalid: false });

            Enigma.init().then(() => {

                    // Streams creation: IPFS (READABLE) - STREAM BROWSER-FILESYSTEM (WRITABLE)
                    let streamToFS = streamSaver.createWriteStream("filename1", { flag: "a" });
                    const writer = streamToFS.getWriter();

                    // Counters declaration.
                    let counter = 0;
                    let len = null;
                    let all = null;
                    let tempArr = [];
                    let tempo = null;

                    let self = this;

                    function decryptFiles(self, id) {

                        let count = 0;
                        let decryption_ended = false;

                        const nextFile = async (limit) => {
                            if (count !== limit) {
                                count += 1;
                                let i = count - 1;

                                new Enigma.AES().init({ key: self.state.decryptedKey }).then(async (aes) => {
                                    let decrypt_stream = aes.decrypt_stream(self.state.decryptedIV);
                                    if(count !== 1) {
                                        //console.log("Establishing decryption context");
                                        decrypt_stream._context_offset = tempo;
                                    }


                                const streamIpfs = ipfs.getReadableStream(all[i].hash);

                                streamIpfs.on('data', (file) => {
                                    //console.log("File: ", file);

                                    if (file.content !== undefined) {

                                        counter += 1;
                                        console.log(counter);

                                        file.content.on('data', (data) => {
                                            tempArr.push(data);       
                                        })

                                        decrypt_stream.on('data', (data) => {
                                            writer.write(data);
                                            
                                        });

                                        decrypt_stream.on('end', (data) => {
                                            console.log("Decryption ended");
                                            decryption_ended = true;

                                        });

                                        file.content.on('finish', (file) => {
                                            //console.log("File reading ended");
                                            let size = tempArr[0].length + tempArr[1].length;
                                            let initArr = new Uint8Array(size);
                                            initArr.set(tempArr[0])
                                            initArr.set(tempArr[1], tempArr[0].length);
                                            //console.log("Writing file");
                                            var rs = Readable();
                                            let j = 0;
                                            rs._read = function () {
                                                //if (j === tempArr.length) return rs.push(null); 

                                                setTimeout(function () {

                                                if (j === 0) {
                                                    j++;

                                                    rs.push(initArr);

                                                }
                                                else {
                                                    j++;

                                                    if (j === tempArr.length) {
                                                        clearTimeout()
                                                        return rs.push(null); 
                                                    }

                                                    else {
                                                        rs.push(tempArr[j]);
                                                    }

                                                    
                                                   
                                                }
  
                                                }, 2);
                                            };

                                            rs.pipe(decrypt_stream);
                                            
                                            const intervalId = setInterval(() => {
                                                //console.log("Waiting for the chunk decryption");
                                                if (decryption_ended === true) {
                                                    decryption_ended = false;

                                                    if (counter === len) {
                                                        writer.close();
                                                        self.setState({ decrypting: false });
                                                    }

                                                    tempo = decrypt_stream._context_offset;
                                                    tempArr = [];

                                                    nextFile(limit);
                                                    clearInterval(intervalId);
                                                }
                        
                                            }, 1000);

                                        });

                                    }
                                })
                            })
                            }
                        }
                        nextFile(len);
                    }
                    // Now we get the number of files in the directory.
        
                    ipfs.ls(id, (err, fileHashes) => {
                        if (err) {
                            return console.log(`There was an error listing the files ${err}`)
                        }

                        all = fileHashes;
                        len = fileHashes.length;
                        decryptFiles(self, id);
                    });
            })
        }
    }

    render () {

        console.log("invalid: ", this.state.invalid);
        let showMyDeals = null;
        let closedDeals = null;

        let spinner = null
        if (this.state.decrypting) {
            spinner = (<React.Fragment>
                        <Spinner />
                            <p> {this.state.msg} </p>
                        </React.Fragment>
            )
        }

        if (this.state.loaded) {

            showMyDeals = (
                <div>
                    <h3> My active deals: </h3>
                    {this.state.results.map(element => {
                        return (
                            <div className={classes.Elements}>
                                <article className={classes.Results}>
                                    <div className={classes.Attributes}>
                                        <p> id: {element.id} </p>
                                        <p> Owner: {element.owner} </p>
                                        <p> Price: {element.price} ETH </p>
                                    </div>

                                    <div className={classes.Display2}>
                                        <button className={classes.InnerButton}
                                            onClick={(event) => this.getFileFromIPFS(event, element.id)}
                                        > Download file </button>
                                        <button onClick={(event) => this.showDecryptDataBox(event, element.id, element.pwdStatus)}
                                            className={classes.InnerButton}> Private key </button>
                                    </div>
                                    <br/>
                                    <div className={classes.Display2}>
                                        <button onClick={(event) => this.recoverAmountHandler(event, element.owner, element.id)}
                                            className={classes.InnerButton}> Amount recovery </button>
                                        <button onClick={(event) => this.allowWithdrawHandler(event, element.id, element.pwdStatus)}
                                            className={classes.InnerButton}> Allow withdrawal </button>
                                        <Modal show={this.state.invalid}>
                                            <button onClick={(event) => this.rejectPasswordHandler(event, element.id, element.pwdStatus)}
                                                className={classes.InnerButton}> Reject password </button>
                                        </Modal>
                                    </div>

                                <div className={classes.Display2}>

                                    <div className={classes.Display3}>
                                    <BoxModal show={this.state.displayBox}
                                        id={element.id}
                                        activeAttributeId={this.state.activeAttributeId}>
                                        <input className={classes.InputElement}
                                            onChange={(event) => this.privateKeyHandler(event, element.id)}
                                            value={this.state.newPrice}
                                            type="password"
                                            placeholder="Please, introduce your private key here..." />
                                        <button className={classes.Button}
                                            onClick={(event) => this.submitPrivateKey(event, element.id)}> OK </button>
                                        <button className={classes.Button}
                                            onClick={(event) => this.hideDecryptDataBox(event)}> Hide </button>
                                    </BoxModal>
                                    </div>
                                    <br/>
                                    <div className={classes.Status}>
                                        {element.pwdStatus === false ? 'Pending: Password by DataOwner' : 'Pending: Allow withdrawal by Buyer'}
                                    </div>
                                    <div className={classes.Status}>
                                        {element.pwdStatus === false ? 'Recovery : Time remaining -> ' + parseInt(((element.withdrawalCheckpointStart - element.time) + (element.withdrawalPeriod)) / 60) + 'mins' : "Recovery disabled"}
                                    </div>

                                </div>

                                </article>
       
                            </div>
                            
                        )
                    })}
                </div>
            )
            
            closedDeals = (
                <div>
                    <h3> My closed deals: </h3>
                    {this.state.closedDealsList.map(element => {
                        return (
                            <div className={classes.Elements}>
                                <article className={classes.Results}>
                                    <div className={classes.Attributes}>
                                        <p> id: {element.id} </p>
                                        <p> Owner: {element.owner} </p>
                                        <p> Price: {element.price} </p>
                                        <button className={classes.GetFileButton} 
                                                onClick={(event) => this.getFileFromIPFS(event, element.id)}
                                                > Decrypt file </button>
                                        <a href={this.state.dataFile} download="myfile.txt"> Download </a>
                                    </div>
                                </article>

                                <div className={classes.ButtonDisplay}>
                                    <button onClick={(event) => this.showDecryptDataBox(event, element.id, true)}
                                        className={classes.Button}> Private key </button>
                                </div>

                                <div className={classes.Display2}>
                                    <div className={classes.Display3}>
                                    <BoxModal show={this.state.displayBox}
                                        id={element.id}
                                        activeAttributeId={this.state.activeAttributeId}>
                                        <input className={classes.InputElement}
                                            onChange={(event) => this.privateKeyHandler(event, element.id)}
                                            value={this.state.newPrice}
                                            type="password"
                                            placeholder="Please, introduce your private key here..." />
                                        <button className={classes.Button}
                                            onClick={(event) => this.submitPrivateKey(event, element.id)}> OK </button>
                                        <button className={classes.Button}
                                            onClick={(event) => this.hideDecryptDataBox(event)}> Hide </button>
                                    </BoxModal>
                                    </div>
                                </div>
                            </div>    
                        )
                    })}
                </div>
            )
        }

        return (
            <React.Fragment>
                <SpinnerModal show={this.state.decrypting}>
                        {spinner}
                </SpinnerModal>
                <h2> Buyer Page: </h2>

                <br/>

                <div className={classes.Request}>
                    <p> Data Owner status: </p>
                    <button className={classes.Button}
                            onClick={this.requestDataOwnerStatus}> Request </button>
                </div>

                <br/>
                
                <section>
                    {showMyDeals}
                </section>

                <br/>

                <section>
                    {closedDeals}
                </section>

            </React.Fragment>
        )
    }
}

export default Buyer; 