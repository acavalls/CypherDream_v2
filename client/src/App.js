import React, { Component, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './hoc/Layout/Layout';
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import MarketplaceContract from "./contracts/Marketplace.json";

import './App.css';

const Home  = React.lazy( () => import ('./containers/Home/Home'));
const Tutorial  = React.lazy( () => import ('./containers/Tutorial/Tutorial'));
const Marketplace  = React.lazy( () => import ('./containers/Marketplace/Marketplace'));
const Profile  = React.lazy( () => import ('./containers/Profile/Profile'));
const MyDatasets = React.lazy( () => import ('./containers/Views/DataOwner/MyDatasets/MyDatasets'));
const MyDeals = React.lazy( () => import ('./containers/Views/DataOwner/MyDeals/MyDeals'));
const Forms = React.lazy( () => import ('./containers/Views/DataOwner/Forms/Forms'));

class App extends Component {
  constructor(props){
    super(props)

    this.state = { 
      web3: null, 
      accounts: null, 
      contract: null,
      admin: null,
      dataOwner: null,
      buyer: null
    }
  }

  componentDidMount = async () => {
    // Get network provider and web3 instance.
    const web3 = await getWeb3();
    
    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();

    // Get the contract instance.
    const Contract = truffleContract(MarketplaceContract);
    Contract.setProvider(web3.currentProvider);

    const instance = await Contract.deployed();
    const admin = await instance.checkAdminStatus(accounts[0]);
    const dataOwner = await instance.checkDataOwnerStatus(accounts[0]);
    let buyer = true;
    if(admin === true || dataOwner === true) {
      buyer = false;
    }

    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    this.setState({ web3, 
                    accounts, 
                    contract: instance, 
                    admin, 
                    dataOwner, 
                    buyer });
  }
  
  
  render() {
    return (

      <Layout>
      
        <Switch>

          <Route path="/" active exact
            render={() => (<Suspense fallback={<div> Loading home... </div>} >
              <Home />
            </Suspense>
            )} />

          <Route path="/tutorial" exact
            render={() => (<Suspense fallback={<div> Loading tutorial... </div>} >
              <Tutorial />
            </Suspense>
            )} />

          <Route path="/marketplace" exact
            render={() => (<Suspense fallback={<div> Loading marketplace... </div>} >
              <Marketplace contract={this.state.contract}
                           accounts={this.state.accounts}
                           web3={this.state.web3}/>
            </Suspense>
            )} />

          <Route path="/profile" exact
            render={() => (<Suspense fallback={<div> Loading profile... </div>} >
              <Profile admin={this.state.admin} 
                       dataOwner={this.state.dataOwner}
                       buyer={this.state.buyer} 
                       accounts={this.state.accounts}
                       contract={this.state.contract} />
            </Suspense>
            )} />

          <Route path="/profile/Forms" exact
            render={() => ( <Suspense fallback={<div> Loading profile... </div>} >
              <Forms
                accounts={this.state.accounts}
                contract={this.state.contract}
                dataOwner={this.state.dataOwner} />
              </Suspense>
            )} />

          <Route path="/profile/MyDatasets" exact
            render={() => ( <Suspense fallback={<div> Loading profile... </div>} >
              <MyDatasets
                accounts={this.state.accounts}
                contract={this.state.contract}
                dataOwner={this.state.dataOwner} />
              </Suspense>
            )} />

          <Route path="/profile/MyDeals" exact
            render={() => (<Suspense fallback={<div> Loading marketplace... </div>} >
              <MyDeals 
                accounts={this.state.accounts}
                contract={this.state.contract}
                dataOwner={this.state.dataOwner} />
            </Suspense>
            )} />

        </Switch>
      </Layout>
    );
  }
}

export default App;
