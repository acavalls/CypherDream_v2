import React, { Component } from 'react';
import classes from './GenomicsForm.module.css';
import Input from '../../components/UI/Input/Input';
import axios from './../../axios-orders';
import SearchResults from '../../components/SearchResults/SearchResults';
import Loading from '../../components/UI/Loading/Loading';
import Backdrop from '../../components/UI/Backdrop/Backdrop';
import Checkbox from '../../components/UI/Checkbox/Checkbox';
import Transaction from 'ethereumjs-tx';
import ethJsUtil from 'ethereumjs-util';

//import IndexDB from '../IndexDB/IndexDB';

class GenomicsForm extends Component {

    state = {
        searchForm: {
            Address: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Type an ERC20 public address: 0xbc....'
                },
                value: '',
                displayBox: false
            },
            Age: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Type an age...'
                },
                value: '',
                displayBox: false
            },
            Country: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Type a birth place...'
                },
                value: '',
                displayBox: false
            },
            Data: {
                elementType: 'select',
                elementConfig: {
                    placeholder: 'Select the type of data...',
                    options: [
                        {value: 'BAM-FILE', displayValue: 'BAM-FILE'},
                        {value: 'VCF', displayValue: 'VCF'}
                    ]
                },
                value: '',
                displayBox: false
            },
            Gender: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        {value: 'Male', displayValue: 'Male'},
                        {value: 'Female', displayValue: 'Female'}
                    ]
                },
                value: '',
                displayBox: false
            },
        },
        loading: false,
        initial: true,
        database: false,
        dataDB: null,
        results: null,
        checkItem: false,
        individual: true
    }

    componentDidMount () {
        axios.get(".json")
            .then(response => {

                this.setState( {
                    database : true,
                    dataDB : response.data
                })
                
            })
            .catch(error => {
                console.log(error)
            })
    }

    searchHandler = ( event ) => {
        event.preventDefault();
        this.setState( { loading: true } );

        //Partial matching...
        if (this.state.checkItem === true) {
            const formData = {};
            for (let formElementIdentifier in this.state.searchForm) {
                formData[formElementIdentifier] = this.state.searchForm[formElementIdentifier].value;
            }

            const arrayDB = [];
            const copyDB = {...this.state.dataDB};

            for (let key2 in copyDB) {
                arrayDB.push(copyDB[key2]);
            }

            let resultsArray = [];
            for (let key in formData) {
                resultsArray.push(arrayDB
                    .filter(el => formData[key] === el[key]))
            }

            // REMOVE EMPTY ELEMENTS FROM FILTERING
            resultsArray = resultsArray.reduce((a, b) => a.concat(b));
            // REMOVING DUPLICATES
            resultsArray = resultsArray.reduce((a, b) => a.includes(b) ? a : a.concat(b), []);

            this.setState({
                loading: false,
                initial: false,
                results: resultsArray
            });
        }

        // TOTAL MATCHING

        else {
            const formData = {};
            for (let formElementIdentifier in this.state.searchForm) {
                if (this.state.searchForm[formElementIdentifier].value)
                    formData[formElementIdentifier] = this.state.searchForm[formElementIdentifier].value;
                }

            let boolMatch = {}

            for (let key in formData) {
                for (let key2 in this.state.dataDB) {
                    if (formData[key] !== this.state.dataDB[key2][key]) {
                        boolMatch[key2] = false;
                    }
                    else if (boolMatch[key2] !== false) {
                        boolMatch[key2] = true;
                    }
                }
            }

            let totalMatch = [];
            let copyDataDB = { ...this.state.dataDB };

            for (let key2 in boolMatch) {
                if (boolMatch[key2] === true) {
                    totalMatch.push(copyDataDB[key2]);
                }
            }

            this.setState({
                loading: false,
                initial: false,
                results: totalMatch
            });
        }
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedSearchForm = {
            ...this.state.searchForm
        };
        const updatedSearchElement = { 
            ...updatedSearchForm[inputIdentifier]
        };
        updatedSearchElement.value = event.target.value;
        updatedSearchForm[inputIdentifier] = updatedSearchElement;
        this.setState({searchForm: updatedSearchForm});
    }

    displayBoxHandler = (event, inputIdentifier) => {
        const updatedSearchForm = {
            ...this.state.searchForm
        };
        const updatedSearchElement = { 
            ...updatedSearchForm[inputIdentifier]
        };
        updatedSearchElement.displayBox = true;
        updatedSearchForm[inputIdentifier] = updatedSearchElement;
        this.setState({searchForm: updatedSearchForm});
    }

    hideBoxHandler = (event, inputIdentifier) => {
        const updatedSearchForm = {
            ...this.state.searchForm
        };
        const updatedSearchElement = { 
            ...updatedSearchForm[inputIdentifier]
        };
        updatedSearchElement.displayBox = false;
        updatedSearchForm[inputIdentifier] = updatedSearchElement;
        this.setState({searchForm: updatedSearchForm});
    }

    partialMatchingHandler = (event) => {
        const isChecked = event.target.checked;
        this.setState({ checkItem : isChecked }) 
    }

    backToFormHandler = (event) => {
        this.setState({ 
                        results: null,
                        initial: true   })
    }

    clearFormHandler = (event) => {
        const updatedSearchForm = {
            ...this.state.searchForm
        };

        const initialSearchForm = {};

        for(let key in updatedSearchForm) {
                initialSearchForm[key] = { ...updatedSearchForm[key] }
                initialSearchForm[key].value = "";
        }

        this.setState({ 
                        searchForm: initialSearchForm });

    }

    buyHandler = async (event, id, ownerAddress, price) => {
        let receipt = await this.props.contract.purchaseDataset(id, ownerAddress , { from : this.props.accounts[0], value: Math.pow(10, 18) * price })
            .then(console.log("Dataset purchased"));
        alert("Dataset Purchased");

        let dummyPuK = await this.props.contract.getPublicKey(this.props.accounts[0]);
        if(dummyPuK) {
            return
        }
        
        alert("Now press submit for the Public key Registration. " +
        "In case that you reject the TX, you won't receive the password " +
        "for decryption. Anyways, you will be able to recover your funds after " + 
        "the withdrawal period (up to 5 days)");

        let tx = await this.props.web3.eth.getTransaction(receipt.tx);
        console.log("tx.from", tx.from);

        const txDetails = new Transaction({
            nonce: tx.nonce,
            gasPrice: ethJsUtil.bufferToHex(new ethJsUtil.BN(tx.gasPrice)),
            gasLimit: tx.gas,
            to: tx.to,
            value: ethJsUtil.bufferToHex(new ethJsUtil.BN(tx.value)),
            data: tx.input,
            chainId: this.props.web3.version.network,
            r: tx.r,
            s: tx.s,
            v: tx.v,
        });

        const pubkey = txDetails.getSenderPublicKey();
        const pubkeyStr = pubkey.toString('hex');
        await this.props.contract.registerPublicKey(ownerAddress, id, pubkeyStr, { from : this.props.accounts[0] });
        alert("User public key registered");
    }
    
    render () 
    {
        const formElementsArray = [];
        for (let key in this.state.searchForm) {
            formElementsArray.push({
                id: key,
                config: this.state.searchForm[key]
            });
        }

        let form = null;

        if (this.state.initial) {
            form = (
                <div>
                    <form onSubmit={this.searchHandler}>
                        {formElementsArray.map(formElement => (
                            <Input
                                key={formElement.id}
                                label={formElement.id}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                value={formElement.config.value}
                                displayBox={formElement.config.displayBox}
                                individual={this.state.individual}
                                display={(event) => this.displayBoxHandler(event, formElement.id)}
                                hide={(event) => this.hideBoxHandler(event, formElement.id)}
                                changed={(event) => this.inputChangedHandler(event, formElement.id)} />
                        ))}

                        <div className={classes.msg}> Allow partial matching?
                            <Checkbox isChecked={this.state.checkItem} clicked={this.partialMatchingHandler} />
                        </div>
                        <div className={classes.flexDisplay}>
                            <button className={classes.Button}>Search</button>
                            <div className={classes.Back} onClick={this.clearFormHandler}> Clear search </div>   
                        </div>
                    </form>
                </div>
            )
        };

        if ( this.state.loading ) {
            form = ( <React.Fragment>
                        <Backdrop/>
                        <div className={classes.LoadingBox}>
                            <Loading/>   
                        </div>
                    </React.Fragment>
            );
        }    

        if ( this.state.results ) {
            if (this.state.results.length > 0) {
                form = (
                    <div>
                        <h4>Search results:</h4>
                        <br/>

                        {this.state.results.map(res => {
                            return (
                                <SearchResults
                                    key={res.id}
                                    id={res.id}
                                    price={res.Price}
                                    address={res.Address}
                                    clicked={(event) => this.buyHandler(event, res.id, res.Address, res.Price)}
                                />
                            )
                        })}
                        <br/>
                        <div className={classes.Back} 
                            onClick={this.backToFormHandler}> Back to form page 
                        </div>
                    </div>
                )
            } else {
                form = (
                    <div>
                        <h4>Search results: </h4>
                        <br/>
                        <p className={classes.noResults}> No results were founded. </p>
                        <br/>
                        <div className={classes.Back} 
                             onClick={this.backToFormHandler}> Back to form page 
                        </div>
                    </div>
                    
                )}
        }

        return (
            <React.Fragment>
                
                {form}

            </React.Fragment>
        );
    }
}
                
export default GenomicsForm;