import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import {
		priceChartLoadedSelector,
		priceChartSelector
		} from '../store/selectors'

		import {chartOptions, dummyData} from './PriceChart.config'


const priceSymbol =(priceChange) =>{
	let output 
	if (priceChange === '+'){
		output = <span className='text-success'>&#9650;</span>
	}
	else{
		output = <span className='text-success'>&#9660;</span>
	}
	return output
}
const showPriceChart = (priceChartData) => {
	return(
		<div className="price-chart">
		<div className="price">
			<h4>DAPP/ETHER &nbsp; {priceSymbol(priceChartData.lastPriceChange)}{priceChartData.lastPrice}</h4>
		</div>
			<Chart options={chartOptions} series={priceChartData.series} type='candlestick' width='100%' height='120%' />
    </div>
	)
}
class PriceChart extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
              <div className="card-header">
                Price Chart
              </div>
              <div className="card-body">
              	{this.props.showPriceChart? showPriceChart(this.props.priceChartData): <Spinner type='div'/>}
              </div>
            </div>
    )
  }
}

function mapStateToProps(state) {
	// console.log({
 //   		showPriceChart : priceChartLoadedSelector(state),
 //   		priceChartData : priceChartSelector(state)

 //  })
  return {
   		showPriceChart : priceChartLoadedSelector(state),
   		priceChartData : priceChartSelector(state)

  }
}

export default connect(mapStateToProps)(PriceChart);