import React, { Component } from 'react';
import {connect} from 'react-redux'
import './App.css';
import  Navbar from './navbar.js';
import  Content from './Content.js';
import Web3 from 'web3'
import Token from '../abis/Token.json' 
import {loadweb3, loadAccount, loadToken, loadExchange } from '../store/interactions'
import {contractLoadedSelector, exchangeSelector} from '../store/selectors'

class App extends Component {
    componentWillMount() {
       this.loadBlockchainData(this.props.dispatch)
    }

    async loadBlockchainData(dispatch) {
     const web3 = loadweb3(dispatch) //new Web3(window.ethereum)
     console.log("web3", web3);
     // const network = await web3.eth.net.getNetworkType();
     // console.log(network)
     // web3.eth.getAccounts().then(console.log);
     
       const networkId = await web3.eth.net.getId()
       //const accounts = await web3.eth.getAccounts()-- used from reducers
       const accounts = await loadAccount(web3, dispatch)
       const token = await loadToken(web3, networkId, dispatch) //new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
       if(!token){
        window.alert('Token Contract not deployed to the current network. Please select another network with Metamask.')
        return
       }
       const exchange = await loadExchange(web3, networkId, dispatch)
       if(!exchange){
        window.alert('Exchange Contract not deployed to the current network. Please select another network with Metamask.')
        return
       }
      
      const totalSupply = await token.methods.totalSupply().call()
      console.log("totalSupply", totalSupply)
   }

  render() {
    
    return (
      <div>
        <Navbar/>
        {this.props.contractLoaded ? <Content/> : <div className="content"></div>}
        
      </div>
    );
  }
}

function mapStateToProps(state){
  
    return{
      contractLoaded : contractLoadedSelector(state)      
    }
  }

export default connect(mapStateToProps)(App);


