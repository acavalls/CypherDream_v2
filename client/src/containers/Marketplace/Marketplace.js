import React, { Component } from 'react';
import classes from './Marketplace.module.css';
import Genomics from '../../containers/GenomicsForm/GenomicsForm';
import Dicom from '../../containers/DicomForm/DicomForm';

class Marketplace extends Component {
    state = {
        genomicsForm : false,
        dicomForm : false
    }

    genomicsFormHandler = () => {
        this.setState( { genomicsForm : true, 
                         dicomForm : false })
    }

    dicomFormHandler = () => {
        this.setState( { dicomForm : true,
                         genomicsForm: false })
    }

    render() {

        let genomicsForm = null;
        let dicomForm = null;

        if (this.state.genomicsForm) {
            genomicsForm = <Genomics contract={this.props.contract}
                                     accounts={this.props.accounts}
                                     web3={this.props.web3}
                                     />
        }

        if (this.state.dicomForm) {
            dicomForm = <Dicom contract={this.props.contract}
                               accounts={this.props.accounts}
                               web3={this.props.web3}
                               />
        }

        return (
            <div>
               <h2> Marketplace Area </h2>
               <h4> Data search </h4>
               <br/>


            <div id="accordion">
                <div class="card">
                    <div class="card-header">
                        <h5>
                            <a href="#collapse1" data-parent="#accordion" data-toggle="collapse">
                                GENOMICS
                            </a>
                        </h5>
                    </div>
                    <div id="collapse1" class="collapse">
                        <div class="card-body">
                            <Genomics contract={this.props.contract}
                                      accounts={this.props.accounts}
                                      web3={this.props.web3}
                                />
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h5>
                            <a href="#collapse2" data-parent="#accordion" data-toggle="collapse">
                                DICOM
                            </a>
                        </h5>
                    </div>
                    <div id="collapse2" class="collapse">
                        <div class="card-body">
                            <Dicom contract={this.props.contract}
                                   accounts={this.props.accounts}
                                   web3={this.props.web3}
                                />
                        </div>
                    </div>
                </div>
            </div>
            </div>
        )}
    }
                
export default Marketplace;