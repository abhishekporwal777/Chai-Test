import React, {Component} from 'react'
import {connect} from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import {filledOrdersSelector, filledOrdersLoadedSelector} from '../store/selectors'



class NewOrder extends Component {
	render() {
    	
  const showForm = (props) =>{
    return (
      <Tabs defaultActiveKey="buy" className="bg-dark text-white">

      <Tab eventKey="buy" title="Buy" className="bg-dark">
      buy
      </Tab>
      <Tab eventKey="sell" title="Sell" className="bg-dark">
      sell
      </Tab>
      </Tabs>
      )
  }
    	return (
      <div className="vertical">
    		<div className="card bg-dark text-white"> 
              <div className="card-header">
                New Order
              </div>
              <div className="card-body">
                {showForm(this.props)}
              </div>
            </div>
          </div>  
    		)
    }
}
  function mapStateToProps(state){
  	return{
    	filledOrders : filledOrdersSelector(state),
      filledOrdersLoaded: filledOrdersLoadedSelector(state)
  	}
	}

export default connect(mapStateToProps)(NewOrder);