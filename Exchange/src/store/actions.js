export function web3Loaded(connection){
	return {
		type : 'WEB3_LOADED',
		connection : connection
	}
}

export function web3AccountLoaded(account){
	return {
		type : 'WEB3_ACCOUNT_LOADED',
		account : account
	}
}

export function tokenLoaded(contract){
	return {
		type : 'TOKEN_LOADED',
		contract
	}
}


export function exchangeLoaded(contract){
	return {
		type : 'EXCHANGE_LOADED',
		contract
	}
}

export function cancelledOrdersLoaded(cancelledOrders){
	return {
		type : 'CANCELLED_ORDERS_LOADED',
		cancelledOrders
	}
}


export function filledOrdersLoaded(filledOrders){
	return {
		type : 'FILLED_ORDERS_LOADED',
		filledOrders
	}
}

export function allOrdersLoaded(allOrders){
	return {
		type : 'ALL_ORDERS_LOADED',
		allOrders
	}
}

export function orderCancelling(order){
	return {
		type : 'ORDER_CANCELLING',
		order
	}
}


export function orderCancelled(order){
	return {
		type : 'ORDER_CANCELLED',
		order
	}
}

export function orderFilling(order){
	return {
		type : 'ORDER_FILLING',
		order
	}
}

export function orderFilled(order){
	return {
		type : 'ORDER_FILLED',
		order
	}
}


export function buyOrderAmountChanged(amount){
	return {
		type : 'BUY_ORDER_AMOUNT_CHANGED',
		amount
	}
}

export function buyOrderPriceChanged(price){
	return {
		type : 'BUY_ORDER_PRICE_CHANGED',
		price
	}
}

export function buyOrderMaking(price){
	return {
		type : 'BUY_ORDER_MAKING',
		price
	}
}

export function orderMade(order){
	return {
		type : 'ORDER_MADE',
		order
	}
}


export function sellOrderAmountChanged(amount){
	return {
		type : 'SELL_ORDER_AMOUNT_CHANGED',
		amount
	}
}

export function sellOrderPriceChanged(price){
	return {
		type : 'SELL_ORDER_PRICE_CHANGED',
		price
	}
}

export function sellOrderMaking(price){
	return {
		type : 'SELL_ORDER_MAKING',
		price
	}
}