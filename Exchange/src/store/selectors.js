import {createSelector} from 'reselect'
import {get, reject, groupBy, maxBy, minBy} from 'lodash'
import {ETHER_ADDRESS, tokens, ether, RED, GREEN} from '../helpers'
import moment from 'moment'

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)


export const contractLoadedSelector =createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
	)


const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, fol => fol)

const allOrders = state => get(state, 'exchange.allOrders.data',[])
export const allOrdersSelector = createSelector(allOrders, o=>o)

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, fol => fol)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data',[])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o=>o)


const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, fol => fol)

const filledOrders = state => get(state, 'exchange.filledOrders.data',[])
export const filledOrdersSelector = createSelector(filledOrders, (orders) => {
	// for price comaprision
	orders = orders.sort((a,b)=> a.timestamp - b.timestamp)

	 orders = decorateFilledOrders(orders)
	 //console.log('decorateFilledOrders', orders)

	// sort orders by timestamp
	orders = orders.sort((a,b)=> b.timestamp - a.timestamp)
	return orders
	})

const decorateFilledOrders = (orders) => {
	let previousOrder = orders[0]
	return orders.map((order)=> {
		order = decorateOrder(order)

		order = decorateFilledOrder(order, previousOrder)
		previousOrder = order
		 return order

	})
}

const decorateFilledOrder = (order, previousOrder)=>{
	return ({...order, tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)})
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder)=>{
	if (previousOrder.id === orderId){
		return GREEN
	}
	if (previousOrder.tokenPrice <= tokenPrice)
	{
		return GREEN // success class
	}
	else{
		return RED // danger class
	}
}

const decorateOrder = (order) => {
	let etherAmount
	let tokenAmount

	if (order.tokenGive === ETHER_ADDRESS //'0x0000000000000000000000000000000000000000'
		){
		etherAmount = order.amountGive
		tokenAmount = order.amountGet
	} else{
		etherAmount = order.amountGet
		tokenAmount = order.amountGive
	}

	const precision = 100000
	let tokenPrice = (etherAmount / tokenAmount)
	tokenPrice = Math.round(tokenPrice * precision) /precision 
	order = {...order, etherAmount: ether(etherAmount), tokenAmount: tokens(tokenAmount), tokenPrice: tokenPrice, formattedTimestamp : moment.unix(order.timestamp).format('h:mm:ss a M/D')}
	
	return  order
	
}

const openOrders = state => {
	const all = allOrders(state)
	const cancelled = cancelledOrders(state)
	const filled = filledOrders(state)

	const open  = reject(all, (order)=>{
	const orderFilled = filled.some((o)=> o.id === order.id)
	const ordercancelled = cancelled.some((c)=> c.id === order.id)
	return (orderFilled || ordercancelled)
	})
	
	return open
}
const orderBookLoaded = state => cancelledOrdersLoaded(state) && allOrdersLoaded(state) && filledOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {
		orders = decorateOrderBookOrders(orders)

		//group orders by type
		orders = groupBy (orders, 'orderType')
		
		//sort by token price
		const buyOrders = get(orders, 'BUY', [])
		orders = {...orders, buyOrders: buyOrders.sort((a,b)=> b.tokenPrice - a.tokenPrice)}

		const sellOrders = get(orders, 'SELL', [])
		orders = {...orders, sellOrders: sellOrders.sort((a,b)=> b.tokenPrice - a.tokenPrice)}

		return orders
	}
)

const decorateOrderBookOrders = (orders) =>{
	return (
		orders.map((order)=>{
			order = decorateOrder(order)
			//console.log('decorateOrder', order)
			order = decorateOrderBookOrder(order)	
			//console.log('decorateOrderBookOrder', order)
			return order
		})
		)
}

const decorateOrderBookOrder = (order) =>{
	const orderType = order.tokenGive === ETHER_ADDRESS ? 'BUY' : 'SELL'
	const orderTypeClass = orderType === 'BUY' ? 'GREEN' : 'RED'

	return ({...order, orderType : orderType, orderTypeClass : orderTypeClass, orderFillClass :  orderType === 'BUY' ? 'SELL' : 'BUY'})
}


export const myFilledOrderLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const myFilledOrdersSelector = createSelector(
	account,
	filledOrders,
	(account, orders)=>{
		orders = orders.filter((o)=> o.user === account || o.userFill || account)
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		
		orders = decorateMyFilledOrders(orders, account)
		//console.log('myfilledOrders after dec', orders)
		return orders
	}
)


const decorateMyFilledOrders = (orders, account) =>{
	return (
		orders.map((order)=>{
			order = decorateOrder(order)
			//console.log('decorateOrder', order)
			order = decorateMyFilledOrder(order, account)	
			//console.log('decorateOrderBookOrder', order)
			return order
		})
		)
}


const decorateMyFilledOrder = (order, account) => {
  const myOrder = order.user === account



  let orderType
  if(myOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
  }

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderSign: (orderType === 'buy' ? '+' : '-')
  })
}


export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const myOpenOrdersSelector = createSelector(
	account,
	openOrders,
	(account, orders)=>{
		orders = orders.filter((o)=> o.user === account)
		orders = decorateMyOpenOrders(orders, account)
		orders = orders.sort((a,b) => b.timestamp - a.timestamp)
		return orders
		
	}
)

const decorateMyOpenOrders = (orders, account) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateMyOpenOrder(order, account)
      return(order)
    })
  )
}


const decorateMyOpenOrder = (order, account) => {
  let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED)
  })
}


export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const priceChartSelector = createSelector(
	filledOrders, 
	(orders) =>{
		orders = orders.sort((a,b) => a.timestamp - b.timestamp)
		orders = orders.map((order) => decorateOrder(order))
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.length -2, orders.length )
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)
		return ({
			lastPrice: lastPrice,
			lastPriceChange : (lastPrice >= secondLastPrice ? '+': '-'),
			series: [{
				data: buildGraphData(orders)
			}]
		})
	}
)

const buildGraphData = (orders)=>{
	// group orders by hours
	orders = groupBy(orders, (o)=> moment.unix(o.timestamp).startOf('minute').format())

	// get those hours where data exists
	const hours = Object.keys(orders)
	const graphData = hours.map((hour)=> {
		const group = orders[hour]
		const open = group[0]
		const close = group[group.length -1]
		const high = maxBy(group, 'tokenPrice')
		const low = minBy(group, 'tokenPrice')
		return ({
			x: new Date(hour),
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})
	return graphData
}

const orderCancelling = state => get(state, 'exchange.orderCancelling.status', false)
export const orderCancellingSelector = createSelector(orderCancelling, s=> s)

const orderFilling = state => get(state, 'exchange.orderFilling.status', false)
export const orderFillingSelector = createSelector(orderFilling, s=> s)






