import React, { Component } from 'react';
import classes from './Tutorial.module.css';

class Tutorial extends Component {

    render() {

        let message = (

            <React.Fragment>
                <div>
                    <h3 > Tutorial: </h3>

                    <div className={classes.area}> <p> A) Connecting to the Ethereum blockchain: </p> </div>
                    <div className={classes.FirstLayer}>
                        <ul class="fa-ul">
                            <li>
                                <div>
                                    <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                    Download the Metamask extension for your browser

                                    <span style={{ color: "black" }}> : </span>

                                    &nbsp;

                                    <a href="https://metamask.io/"
                                        className={classes.link}>
                                        Click here!
                                    </a>
                                </div>
                            </li>
                            <br />
                            <li>
                                <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                Create a Metamask account.
                            </li>
                        </ul>
                    </div>

                    <div className={classes.area}>
                        <p> B) Platform usage: </p>
                    </div>
                    <div className={classes.FirstLayer}>
                        <div class="card border border-light">
                            <div class="card-header border border-light">
                                <div className={classes.setFont}> As a Buyer </div>
                            </div>
                            <div class="card-body">

                                <p className={classes.setFontSub}> MARKETPLACE </p>
                                <ul class="fa-ul">
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Select the class of data and fill the boxes with the features of interest.
                                    </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right"></i></span>
                                        Click the "Buy" button in one of the resulting items. A metamask popup should appear.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right"></i></span>
                                        Click the "Submit" button for the transaction completion.
                                </li>
                                </ul>

                                <br />

                                <p className={classes.setFontSub}> PROFILE </p>
                                <ul class="fa-ul">
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Request Data Owner status: Click the "Request" button and submit the transaction with Metamask.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Download file: Click the "Private Key" button and paste your private key from Metamask
                                        (Go to Account Options - Account Details - Export Private key). Then click the "Download file" button.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Amount recovery: Click the "Amount recovery" button if the Data Owner doesn't upload the dataset decryption
                                        keys after 4 days.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Allow withdrawal: Click the "Allow withdrawal" button if the decryption keys uploaded by the Data Owner are valid.
                                </li>

                                </ul>

                            </div>
                        </div>
                    </div>

                    <div className={classes.FirstLayer}>
                        <div class="card border border-light">
                            <div class="card-header border border-light">
                                <div className={classes.setFont}> As a Data Owner </div>
                            </div>
                            <div class="card-body">

                                <p className={classes.setFontSub}> PROFILE </p>
                                <ul class="fa-ul">
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        Upload dataset: Select the class of data and fill the boxes with the features of interest. Once done, introduce an alphanumeric seed in the proper box and click "OK".
                                        The upload file section should be displayed after the seed is submitted. Write down and store the decryption key and IV shown in the screen once the upload is completed.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        My Datasets: List of datasets uploaded by the DataOwner. The user is able to remove or change the price of each dataset.
                                </li>
                                    <br />
                                    <li>
                                        <span class="fa-li"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                                        My Deals: List of active deals and closed deals. In the Active Deals section, the Data Owner is able to submit the decryption keys of the selected datasets or withdraw
                                        the corresponding amount if the deal succeeds.
                                </li>

                                </ul>

                            </div>
                        </div>
                    </div>

                    <div className={classes.FirstLayer}>

                        <div className={classes.area}>
                            <p> C) F.A.Q: </p>
                        </div>
                        <div id="accordion">
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse1" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Buyer: How long do I have to wait for getting the decryption keys after purchasing a dataset?
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse1" class="collapse">
                                    <div class="card-body">
                                        The Data Owner will have up to 4 days to submit the dataset decryption keys. If they are not submitted
                                        you will able to recover the tokens deposited in the contract. In the profile section click "Amount recovery".
                            </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse2" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Buyer: What should I do if the dataset decryption keys are invalid?
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse2" class="collapse">
                                    <div class="card-body">
                                        Once you receive the keys you will have up to 4 days in order to reject them. In the profile section click the "Amount recovery"
                                        button before the deadline. This action will give the Data Owner the opportunity to upload them again following the same rules as
                                        before. If the decryption keys are invalid again, then, you will be able to recover the deposited tokens in the contract.
                                        In the profile section click "Amount recovery".
                            </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse3" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Buyer: What happens if the dataset decryption keys are invalid and I forgot to reject them before the deadline (4 days)?
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse3" class="collapse">
                                    <div class="card-body">
                                        The Data Owner will have the right over the tokens in custody. Furthermore, you won't be able to ask for new decryption keys.
                            </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse4" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Data Owner: What happens if someone buys my dataset?
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse4" class="collapse">
                                    <div class="card-body">
                                        You will have 4 days for submitting the decryption key and IV. If not, the deal is cancelled and the Buyer will recover the tokens
                                        deposited in the contract. In case you have submitted the keys, you will be able to withdraw the tokens deposited in the contract after the
                                        Buyer has validated the uploaded keys or after the withdraw deadline (4 days) only if the Buyer has not rejected the keys. In the profile
                                        section - My Deals you can check at the bottom of each box-item the deal status.
                            </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse5" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Data Owner: What happens if the Buyer reject my uploaded decryption key and IV?
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse5" class="collapse">
                                    <div class="card-body">
                                        You will have 4 days for submitting the decryption key and IV again. If the Buyer reject the
                                        keys, the tokens in custody will be frozen, and CypherDream will determine the corresponding
                                        good actor and who will get the deal tokens.
                            </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header">
                                    <h5>
                                        <a href="#collapse6" data-parent="#accordion" data-toggle="collapse" className={classes.setFontSub}>
                                            Bad practices
                                </a>
                                    </h5>
                                </div>
                                <div id="collapse6" class="collapse">
                                    <div class="card-body">
                                        <p>1. Reject valid decryption keys repeatedly. CypherDream will ban any Ethereum account that accumulates
                                3 valid rejected keys. </p>
                                        <p>2. Upload corrupted datasets. Depending on the severity of the issue, CypherDream could ban the Ethereum
                                account. </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                </div>
            </React.Fragment>
        )

        return (
            <div className={classes.Tutorial}>
                {message}
            </div>
        )
    }
}

export default Tutorial;