import Web3 from 'web3'

import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled

} from './actions'

import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

 export const loadweb3 = (dispatch) =>{
	const web3 = new Web3(window.ethereum)
	dispatch(web3Loaded(web3))
	return web3
}

 export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts()
  const account = await accounts[0]
  if(typeof account !== 'undefined'){
    dispatch(web3AccountLoaded(account))
    return account
  } else {
    window.alert('Please login with MetaMask')
    return null
  }
}

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
    dispatch(tokenLoaded(token))
    return token
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}


export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
    dispatch(exchangeLoaded(exchange))
    return exchange
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}



export const loadAllOrders = async (exchange, dispatch) => {
  try {
  	// get cancelled order wuth cancel event
  	const cancelStream = await exchange.getPastEvents('CancelOrder', {fromBlock: 0, toBlock: 'latest'})
  	//console.log("cancelStream", cancelStream)
  	const cancelledOrders = cancelStream.map((event)=> event.returnValues)
  	dispatch(cancelledOrdersLoaded(cancelledOrders))

	/// get filles orders with trade event
		const filledOrderStream = await exchange.getPastEvents('Trade', {fromBlock: 0, toBlock: 'latest'})
  	//console.log("filledOrderStream", filledOrderStream)
	const fulfilledOrders = filledOrderStream.map((event)=> event.returnValues)
		dispatch(filledOrdersLoaded(fulfilledOrders))


	// get allorders with order event
	const allOrderStream = await exchange.getPastEvents('Order', {fromBlock: 0, toBlock: 'latest'})
  	
	const allOrders = allOrderStream.map((event)=> event.returnValues)
	dispatch(allOrdersLoaded(allOrders))

    
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}

export const cancelOrder = (dispatch, exchange, order, account) =>{
  //console.log('cancel Order')
  exchange.methods.cancelOrder(order.id).send({from: account}).on('transactionHash', (hash)=>{
      dispatch(orderCancelling(order))
  })
  .on('error', (error)=>{
    console.log(error)
    window.alert('There was an error!')
  })
}

export const subscribeToEvents = async ( exchange, dispatch) => {
  exchange.events.CancelOrder({}, (error, event)=>{
    dispatch(orderCancelled(event.returnValues))
  })

  exchange.events.Trade({}, (error, event)=>{
    dispatch(orderFilled(event.returnValues))
  })
}

export const fillOrder = (dispatch, exchange, order, account) =>{
  console.log('Fill Order')
  exchange.methods.fillOrder(order.id).send({from: account}).on('transactionHash', (hash)=>{
      dispatch(orderFilling(order))
  })
  .on('error', (error)=>{
    console.log(error)
    window.alert('There was an error!')
  })
}
