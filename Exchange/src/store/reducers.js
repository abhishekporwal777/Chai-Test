import {combineReducers} from 'redux';

function web3(state={}, action){
	switch (action.type){
		case 'WEB3_LOADED' :
			return {...state, connection: action.connecction}
		case 'WEB3_ACCOUNT_LOADED' :
			return {...state, account: action.account}
		default :
			return state	
	}

}

function token(state={}, action){
	switch (action.type){
		case 'TOKEN_LOADED' :
			return {...state,loaded: true, contract: action.contract}
		
		default :
			return state	
	}

}

function exchange(state={}, action){
	let index, data
	switch (action.type){
		case 'EXCHANGE_LOADED' :
			return {...state, loaded: true, contract: action.contract}
		case 'CANCELLED_ORDERS_LOADED' :
			return {...state, cancelledOrders: {loaded: true, data: action.cancelledOrders}}
		case 'FILLED_ORDERS_LOADED' :
			return {...state, filledOrders: {loaded: true, data: action.filledOrders}}
		case 'ALL_ORDERS_LOADED' :
			return {...state, allOrders: {loaded: true, data: action.allOrders}}
		case 'ORDER_CANCELLING' :
			return {...state, orderCancelling: {status: true, data: action.order}}
		case 'ORDER_CANCELLED' :
			return {...state, orderCancelling: {status: false, data:[]}, cancelledOrders: {...state.cancelledOrders, data:[...state.cancelledOrders.data, action.order]}}
		case 'ORDER_FILLING' :
			return {...state, orderFilling: {status: true, data: action.order}}
		case 'ORDER_FILLED' :
			index = state.filledOrders.data.findIndex((order)=> order.id === action.order.id)
			if(index === -1){
				data = [...state.filledOrders.data, action.order]
			} else {
				data = state.filledOrders.data
			}

			return {...state, orderFilling: {status: false, data:[]}, 
					filledOrders: {...state.filledOrders, data}
					}

		default :
			return state	
	}

}


const rootReducer = combineReducers({
	web3 : web3,
	token: token,
	exchange : exchange
})

export default rootReducer