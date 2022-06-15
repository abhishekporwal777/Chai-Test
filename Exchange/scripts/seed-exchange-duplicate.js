
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

const ETHER_ADDRESS= '0x0000000000000000000000000000000000000000'

const ether = (n)=>{
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	)
}

const tokens = (n) => ether(n)

const wait = (seconds) =>{
	const miliseconds = 1000* seconds
	return new Promise(resolve => setTimeout(resolve, miliseconds))
}

module.exports = async function(callback){
	
	try{
		console.log('***************seed exchange script running*************')

		const accounts = await web3.eth.getAccounts()

		// get deployed token and exchange
		const token = await	Token.deployed()
		console.log('token address', token.address)

		const exchange = await	Exchange.deployed()
		console.log('exchange address', exchange.address)

		// give tokens to account 1
		const sender = accounts[0]
		const receiver = accounts[1]
		
		let amount
		amount = await web3.utils.toWei('10000', 'ether') // 10000 tokens
		await token.transfer(receiver, amount, {from: sender})
		console.log(`transfered ${amount} tokens from ${sender} to ${receiver}`)

		const user1 = accounts[0]
		const user2 = accounts[1]

		// USER1 DEposit ether
		amount = 1
		await exchange.depositEther({from: user1, value: ether(amount)})

		console.log(`deposited ether ${amount} for user1 ${user1}`)

		// user2 approves and deposit tokens
		amount = tokens(10000)
		await token.approve(exchange.address, amount, {from: user2})
		console.log(`approved amount 10000 by user2 ${user2}`)

		let result
		result = await exchange.depositToken(token.address, amount, {from: user2});
		console.log(`deposited amount ${amount} by user2 ${user2} to exchange`)
		console.log(result)
		console.log(result.logs)


		// create a canceled order by user1
		
		let orderId

		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
		await wait(1)
		console.log(`Make order by user1 ${user1}`)
		
		console.log(result.logs)

		orderId = result.logs[0].args.id
		result = await exchange.cancelOrder(orderId, {from:user1})
		console.log(`Order cancelled by user1 ${user1}`)


		// fulfilling order

		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), {from: user1})
		//const orderCount = await exchange.orderCount()

		await wait(1)
		//console.log (`Order count ${orderCount}`)
		console.log(`Make order by user1 ${user1} for fulfillment steps`)

		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, {from: user2})
		console.log(`Order fulfilled by user2 ${user2}`)

		await wait(1)


		result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), {from: user1})
		console.log(`Make second order by user1 ${user1} for fulfillment steps`)

		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, {from: user2})
		console.log(`second Order fulfilled by user2 ${user2}`)

		await wait(1)

		result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), {from: user1})
		console.log(`Make third order by user1 ${user1} for fulfillment steps`)

		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, {from: user2})
		console.log(`third Order fulfilled by user2 ${user2}`)

		// create Open orders by user 1 and user 2
		for(let i= 0; i<= 10; i++){
			result = await exchange.makeOrder(token.address, tokens(10* i), ETHER_ADDRESS, ether(0.01), {from: user1})
			orderId = result.logs[0].args.id
			console.log(`Make order ${orderId} by user1 ${user1} for Open order steps`)

			await wait(1)

		}

		for(let i= 0; i<= 10; i++){
			result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10* i), {from: user2})
			orderId = result.logs[0].args.id
			console.log(`Make order ${orderId} by user2 ${user2} for Open order steps`)

			await wait(1)

		}

		console.log('***************seed exchange script finished*************')	
	}
	catch(err){
		console.log(err)
	}
	callback()
}