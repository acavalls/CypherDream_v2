'use strict'
import React, { Component } from 'react';
import classes from './Forms.module.css';
import { ipfs } from '../../../../ipfs';
import { ipfsCluster } from '../../../../ipfs';
import Input from '../../../../components/UI/Input/Input';
import Spinner from '../../../../components/UI/Spinner/Spinner';
import SpinnerModal from '../../../../components/UI/SpinnerModal/SpinnerModal';
//import Button from '../../../../components/UI/Button/Button';
import Button2 from '../../../../components/UI/Button2/Button2';
import axios from '../../../../axios-orders';
import { NavLink } from 'react-router-dom';
import bs58 from 'bs58';
import Enigma from '@cubbit/enigma';
import { WebFileStream } from '@cubbit/web-file-stream';
import { BigNumber } from 'bignumber.js';
const { Transform } = require('stream');

// WebWorker helper class
// import MyWorker from './MySomething.worker';
// import WebWorker from './workerHelper';
// Your web worker
// https://github.com/facebook/create-react-app/issues/1277


class Forms extends Component {

    state = {
        buffer: null,
        genomics: false,
        dicom: false,
        initial: true,
        displayForm: false,
        individual: false,
        ipfsHash:  null,
        uploadedData: true,
        seed: null,
        seedConfirmed: false,
        iv: null,
        key: null,
        encryptedData: null,
        idHashArray: [{}],
        idChunkArray: null,
        finalRead: false,
        encrypting: false,
        filesize: null,
        hashesArray: null,
        msg: ["Loading and encrypting your file. Please wait..", "Sending your file to IPFS. Please wait.."],

        searchFormGenomics: {
            Address: {
                elementType: 'input-address',
                value: this.props.accounts[0]
            },
            Age: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Type your age...'
                },
                value: ''
            },
            Country: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Birth place...'
                },
                value: ''
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
                value: ''
            },
            Gender: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        {value: 'Male', displayValue: 'Male'},
                        {value: 'Female', displayValue: 'Female'}
                    ]
                },
                value: ''
            },
            Price: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Select a price for the dataset...'
                },
                value: ''
            },
        },

        searchFormDICOM: {
            Address: {
                elementType: 'input-address',
                value: this.props.accounts[0]
            },
            Data: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        {value: 'XR', displayValue: 'XR'},
                        {value: 'PET', displayValue: 'PET'}
                    ]
                },
                value: ''
            },
            Instrument: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        {value: 'Shimadzu', displayValue: 'Shimadzu'},
                        {value: 'LG Biocare', displayValue: 'LG Biocare'}
                    ]
                },
                value: ''
            },
            Region: {
                elementType: 'select',
                elementConfig: {
                    options: [
                        {value: 'Leg', displayValue: 'Leg'},
                        {value: 'Pancreas', displayValue: 'Pancreas'}
                    ]
                },
                value: ''
            },
            Resolution: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Choose a resolution (A)....'
                },
                value: ''
            },
            Price: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Select a price for the dataset...'
                },
                value: ''
            },
        }
    }

    componentDidUpdate = async () => {
        if (!this.state.uploadedData) {

            let aux = null;
            const formData = {};

            if (this.state.dicom) {
                aux = { ...this.state.searchFormDICOM }
                for (let formElementIdentifier in aux) {
                    formData[formElementIdentifier] = aux[formElementIdentifier].value;
                }
                formData["id"] = this.state.ipfsHash;
            }

            if (this.state.genomics) {
                aux = { ...this.state.searchFormGenomics }
                for (let formElementIdentifier in aux) {
                    formData[formElementIdentifier] = aux[formElementIdentifier].value;
                }
                formData["id"] = this.state.ipfsHash;
            }

            // Upload data to the contract: registerDataset.

            let finalPrice = new BigNumber(Math.pow(10, 18) * formData["Price"]) // where "UA900021343" is the value I need to convert to numbers only so that it is acceptable to MyERC721 contract.

            await this.props.contract.registerDataset(this.state.ipfsHash, finalPrice, { from: this.props.accounts[0] })
                .then(console.log("dataset id (ipfs) registered into the blockchain"));
            // Upload data to the indexation DB.
            axios.post(".json", formData);
            this.setState({ uploadedData: true,
                            seed: null,
                            submitSeed: false,
                            finalRead: true });

            alert("Dataset uploaded");
        }
    }

    displayFormGenomicsHandler = (event) => {
        this.setState({ displayForm :  true, 
                        genomics: true,
                        dicom: false });
    }

    displayFormDICOMHandler = (event) => {
        this.setState({ displayForm :  true, 
                        dicom: true,
                        genomics: false });
    }

    hideBoxGenomicsHandler = (event) => {
        if(this.state.genomics) {
            this.setState({ displayForm: false});
        }
    }

    hideBoxDICOMHandler = (event) => {
        if(this.state.dicom) {
            this.setState({ displayForm: false});
        }
    }

    inputChangedHandler = (event, inputIdentifier) => {
        let updatedSearchForm = null;

        if(this.state.genomics) {
            updatedSearchForm = { ...this.state.searchFormGenomics }
        };

        if(this.state.dicom) {
            updatedSearchForm = { ...this.state.searchFormDICOM }
        };
    
        const updatedSearchElement = { 
            ...updatedSearchForm[inputIdentifier]
        };

        updatedSearchElement.value = event.target.value;
        updatedSearchForm[inputIdentifier] = updatedSearchElement;

        if(this.state.genomics) {
            this.setState({searchFormGenomics: updatedSearchForm});
        };

        if(this.state.dicom) {
            this.setState({searchFormDICOM: updatedSearchForm});
        };
    }

    clearFormHandler = (event) => {
        let updatedSearchForm = null;

        if(this.state.genomics) {
            updatedSearchForm = { ...this.state.searchFormGenomics }
        };

        if(this.state.dicom) {
            updatedSearchForm = { ...this.state.searchFormDICOM }
        };

        const initialSearchForm = {};

        for(let key in updatedSearchForm) {
                initialSearchForm[key] = { ...updatedSearchForm[key] }
                initialSearchForm[key].value = "";
        }

        if(this.state.genomics) {
            this.setState({searchFormGenomics: initialSearchForm});
        };

        if(this.state.dicom) {
            this.setState({searchFormDICOM: initialSearchForm});
        };

    }

    seedHandler = (event) => {
        const dummyPwd = event.target.value;
        this.setState({ seed : dummyPwd })
    }

    submitSeed = (event) => {
        if(this.state.seed) {
            this.setState({ seedConfirmed : true })
        }
    }
    
    getFileHandler = (event) => {

        // On the Web

        let file = event.target.files[0];
        this.setState({ file: file });
    }


    ipfsUploading = (event) => {

        let self = this;

        function createIpfsDirectory(array) {

            // We create an empty directory.
            let dirHash = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

            let count = 0;

            const mergeFiles = async (dirHash, limit) => {
                if (count !== limit) {
                    count += 1;
                    let i = count - 1;
                    console.log("counter files: ", i);
                    console.log("hash:", array[i].hash);
                    console.log("path:", array[i].path);

                    ipfs.object.patch.addLink(dirHash, {
                        name: array[i].path,
                        size: 37,
                        cid: array[i].hash
                    }, (err, cid) => {
                        if (err) {
                            throw err
                        }
                        dirHash = bs58.encode(cid.multihash);
                        mergeFiles(dirHash, limit);
                    })
                } else {
                    console.log("dirHash: ", dirHash);

                    // ***** WE COULD MOVE THIS INTO THE COMPONENTDIDUPDATE COMPONENT.
                    ipfsCluster.pin.add(dirHash, (err) => {
                        if (err) {
                            throw err
                        };
                        console.log("Pin request succesful!");
                    });

                    let id32bytes = "0x" + bs58.decode(dirHash).slice(2).toString('hex');
                    console.log("ok");
                    // ONCE THE DIRECTORY IS CREATED WE REGISTER THE IPFS HASH ENABLING THE UPDATING (UPLOADEDDATA)
                    // IN THE COMPONENTDIDUPDATE LIFECYCLE COMPONENT.
                    self.setState({
                        ipfsHash: id32bytes,
                        uploadedData: false
                    });
                }
            }

            mergeFiles(dirHash, array.length);
        }

        Enigma.init().then(() => {

            let counter = 0;
            let results = null;
            let hashArray = [];

            const key = Enigma.AES.create_key();

            new Enigma.AES().init({ key }).then(async (aes) => {

                let iv_temp = Enigma.Random.bytes(16);
                let key_temp = key;
                let upload = false;
                let finished = false;
                let chunk = 30000000;
                const read_stream = WebFileStream.create_read_stream(this.state.file, { chunk_size: chunk });
                const aes_stream = aes.encrypt_stream(iv_temp);

                class tagAddition extends Transform {
                    constructor(options) {
                        super(options)
                        this.tag = new Uint8Array(65024);
                        this.arr = null
                    }

                    _transform(chunk, encoding, callback) {
                        this.arr = new Uint8Array(this.tag.length + chunk.length);
                        this.arr.set(this.tag);
                        this.arr.set(chunk, this.tag.length);
                        callback(null, this.arr);
                    }
                }

                                    
                const streamFiles = (file, cb) => {
                    //console.log("callback progress streaming")
                    // Create a stream to write files into
                    //console.log("streaming: ", file);
                    const streamer = ipfs.addReadableStream();
                    //console.log(streamer);
                    streamer.on('data', function (data) {
                        //console.log(`Added ${data.path} hash: ${data.hash}`);
                        cb(null, data.hash)
                    })

                    streamer.write(file)
                    streamer.end()
                }
                    
                const tagger = new tagAddition();
                //read_stream.pipe(tagger).pipe(aes_stream);
                read_stream.pipe(aes_stream);

                let temp = null;

                aes_stream.on('data', (data) => {
                    read_stream.pause();
                    aes_stream.pause();
                    temp = Buffer(data);
                
                    //console.log(temp);
                    let fileContent = null;

                    counter += 1;

                    if (counter <= 10) {
                        fileContent = {
                            path: `part_000${counter - 1}.txt`,
                            content: temp
                        }
                    }

                    else if (counter > 10 && counter <= 100) {
                        fileContent = {
                            path: `part_00${counter - 1}.txt`,
                            content: temp
                        }
                    }

                    else if (counter > 100 && counter <= 1000) {
                        fileContent = {
                            path: `part_0${counter - 1}.txt`,
                            content: temp
                        }
                    }

                    else {
                        fileContent = {
                            path: `part_${counter - 1}.txt`,
                            content: temp
                        }
                    }
    
                    streamFiles(fileContent, (err, hash) => {
                        //console.log("stream finished!");
                        //console.log("callback progress streaming finish")
                        if (err) {
                            console.log(`There was an error adding the file ${err}`);
                        }
                        else {

                            let temp = {
                                path: fileContent.path,
                                hash: hash
                            }

                            console.log("hash: ", hash);

                            hashArray.push(temp);

                            upload = true;
                            if (counter * chunk >= this.state.file.size) {
                                finished = true;
                            }
                        }
                    });

                    results = null;
                    //data = null; 
                    temp = null;
                    //upload = true;
                    const intervalId = setInterval(() => {
                        //console.log("inside interval");
                        if (upload === true) {
                            upload = false;
                            read_stream.resume();
                            aes_stream.resume();
                            clearInterval(intervalId);
                        }

                    }, 2500);

                })


                aes_stream.on('end', () => {
                    const intervalId_II = setInterval(() => {
                        if (finished === true) {
                            let iv_temp_hex = Buffer(iv_temp).toString('hex');
                            let key_temp_hex = Buffer(key_temp).toString('hex');
                            //console.log(hashArray);
                            //let id32bytes = "0x" + bs58.decode(hashArray[0]).slice(2).toString('hex');
                            this.setState({ iv: iv_temp_hex, key: key_temp_hex });
                            createIpfsDirectory(hashArray);
                            clearInterval(intervalId_II);
                        }
                        else {
                            console.log("Waiting for the final results")
                        }

                    }, 5000);
                });

            });
        });

        /* ALTERNATIVE IPFS UPLOAD */

        /*results = ipfs.addFromStream(data, (err, result) => {
            console.log(result)
            upload = true;
        })*/

        /*const stream = ipfs.addReadableStream()
        stream.on('data', function (data) {
            console.log(`Added ${data.path} hash: ${data.hash}`);
            console.log(counter);
            upload = true
        })

        stream.write(data)
        stream.end()*/


        /* PLAYING WITH WORKERS */

        //const workerInstance = new WebWorker(MyWorker);
        //const workerInstanceWithParams = new WebWorker(new MyWorker(CryptoJS));
        //console.log(workerInstanceWithParams);
        // Communication with worker
        //workerInstanceWithParams.addEventListener("message", e => console.log(e.data), false);
        //workerInstanceWithParams.postMessage("CryptoJS");
        /*var myWorker = new Worker(worker_script);

        myWorker.onmessage = (m) => {
        console.log("msg from worker: ", m.data);
        };
        myWorker.postMessage('im from main');*/
    }

    render () {
        const formElementsArray = [];
        let submitFile = null;
        let form = null;
        let pwds = null;

        // We load the proper form..
        if (this.state.genomics) {
            for (let key in this.state.searchFormGenomics) {
                formElementsArray.push({
                    id: key,
                    config: this.state.searchFormGenomics[key]
                });
            }
        }

        if (this.state.dicom) {
            for (let key in this.state.searchFormDICOM) {
                formElementsArray.push({
                    id: key,
                    config: this.state.searchFormDICOM[key]
                });
            }
        }

        if (this.state.seedConfirmed) {
            console.log("ok");
            submitFile = (
                <React.Fragment>
                    <br/>
                    <p className={classes.font2}> Please, now select your file. </p>
                    <div className={classes.flexDisplay}>
                        <input type='file' onChange={this.getFileHandler} />
                        <Button2 clicked={(event) => this.ipfsUploading(event)}> OK </Button2>
                    </div>
                </React.Fragment>
            )
        }

        if(this.state.finalRead){
            pwds = (
                <React.Fragment>
                    <br/>
                    <p> Please, write down the decryption key and iv of your dataset. </p>
                    <div> 
                        <div> <strong className={classes.font2}> Decryption key: </strong> {this.state.key} </div>
                        <div>  <strong className={classes.font2}> iv: </strong> {this.state.iv} </div>
                    </div>
                </React.Fragment>
            )
        }

        let spinner = null;
        if (this.state.loading) {
            spinner = ( <React.Fragment>
                            <Spinner/> 
                            <p> {this.state.msg[0]} </p>
                        </React.Fragment>
            )
        }
        let spinner2 = null
        if (this.state.encrypting) {
            spinner2 = (<React.Fragment>
                        <Spinner />
                        <p> {this.state.msg[1]} </p>
                        </React.Fragment>
            )
        }

        if (this.state.displayForm) {
            form = (
                <React.Fragment>
                    <SpinnerModal show={this.state.loading}>
                        {spinner}
                    </SpinnerModal>
                    <SpinnerModal show={this.state.encrypting}>
                        {spinner2}
                    </SpinnerModal>
                    <h4>Enter your search parameters: </h4>
                    <br/>
                    <form>
                        {formElementsArray.map(formElement => (
                            <Input
                                key={formElement.id}
                                label={formElement.id}
                                elementType={formElement.config.elementType}
                                elementConfig={formElement.config.elementConfig}
                                value={formElement.config.value}
                                individual={this.state.individual}
                                displayBox
                                changed={(event) => this.inputChangedHandler(event, formElement.id)} />
                        ))}

                        <div className={classes.blockDisplay}>
                            <div className={classes.Clear} onClick={this.clearFormHandler}> Clear form </div>
                            <div>
                                <p className={classes.font}> Please, select a seed for your file: </p>
                                <div className={classes.flexDisplay}>
                                    <input type="password"
                                        placeholder="Type your seed"
                                        className={classes.font2}
                                        onChange={(event) => this.seedHandler(event)} />
                                    <Button2 clicked={(event) => this.submitSeed(event)}> OK </Button2>
                                </div>
                                    {submitFile}
                            </div>
                        </div>
                        {pwds}
                    </form>

                </React.Fragment>
            )
        };

        return (

            <div>

                <h2> UPLOAD DATASET </h2>

                <h4> SELECT DATA CLASS </h4>

                <br/>

                <div id="accordion">
                    <div class="card">
                        <div class="card-header">
                            <h5>
                                <a href="#collapse1" data-parent="#accordion" data-toggle="collapse"
                                    onClick={(event) => this.displayFormGenomicsHandler(event)}
                                    >
                                    GENOMICS
                            </a>
                            </h5>
                        </div>
                        <div id="collapse1" class="collapse">
                            <div class="card-body">
                                {form}
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h5>
                                <a href="#collapse2" data-parent="#accordion" data-toggle="collapse"
                                    onClick={(event) => this.displayFormDICOMHandler(event)}>
                                    DICOM
                            </a>
                            </h5>
                        </div>
                        <div id="collapse2" class="collapse">
                            <div class="card-body">
                                {form}
                            </div>
                        </div>
                    </div>
                </div>

                <br/>
                <div >
                    <NavLink className={classes.Back}
                             to="/profile" exact> Back to profile </NavLink>
                </div>

            </div>
        )
    }
}

export default Forms; 