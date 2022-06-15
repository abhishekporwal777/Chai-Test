import {createStore, applyMiddleware, compose} from 'redux'
import {createLogger} from 'redux-logger'

import rootReducer from './reducers'

const loggerMiddleware = createLogger()
const middleware =[]

// for redux devtool
const composeEnhancers = window.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preloadedState){
	return createStore(
		rootReducer,
		preloadedState,
		composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
	)
}