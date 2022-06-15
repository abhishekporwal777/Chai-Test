import {tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helpers.js'
const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai')
	.use(require('chai-as-promised')).should()

contract ('Exchange', ([deployer, feeAccount, user1, user2])=>{
	let exchange
	let token
	const feePercent = 10
	

	beforeEach(async()=>{
		exchange = await Exchange.new(feeAccount, feePercent)
		token = await Token.new()
		await token.transfer(user1, tokens(100), {from: deployer})
		
	})

	describe('deployment', ()=>{
		it('Checks the feeAccount setup', async()=>{
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount);
			console.log('fee acount set as ', feeAccount)
		})
		it('Checks the feepercent setup', async()=>{
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString());
			console.log('feePercent set as ', feePercent)
		})
	})

	describe('deposit tokens', ()=>{
		let result;
		let amount

		beforeEach(async()=>{
			amount = tokens(10)
		})
		describe('success', ()=>{
			beforeEach(async()=>{
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: user1});
				result = await exchange.depositToken(token.address, amount, {from: user1});
			})
			it('tracks the token deposit', async()=>{
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString());

				// check exchange token balance
				balance = await exchange.tokenDB(token.address, user1)
				balance.toString().should.equal(amount.toString());				
			})

			it('emits the Deposit event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Deposit');
				const event = log.args;
				event.tokenAddress.should.eq(token.address);
				event.user.should.eq(user1);
				event.amount.toString().should.eq(amount.toString());
				event.balance.toString().should.eq(amount.toString());		
			})
		})

		describe('failure', ()=>{
			it('fails for ether Deposit', async()=>{
				await exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejected;
			})

			it('fails if no approval for the Deposit', async()=>{
				await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
			})
		})
	})

	describe('fallback for ether deposit', ()=>{
		it('reverts when ehter is sent', async()=>{
			await exchange.sendTransaction({value: ether(1), from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('deposit ether', ()=>{
		let result
		let amount 
		

		beforeEach(async()=>{
			amount = ether(1)	
			result =await exchange.depositEther({from: user1, value: amount	})

		})

		it('tracks ether deposit', async()=>{
			const balance = await exchange.tokenDB(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})

		it('emits the Deposit event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Deposit');
				const event = log.args;
				event.tokenAddress.should.eq(ETHER_ADDRESS);
				event.user.should.eq(user1);
				event.amount.toString().should.eq(amount.toString());
				event.balance.toString().should.eq(amount.toString());		
			})
	})

	describe('withdraw ether', ()=>{
		let result
		let amount 
		
		// first deposit then withdraw
		beforeEach(async()=>{
			amount = ether(1)	
			result =await exchange.depositEther({from: user1, value: amount	})

		})
		
		describe('Success', async ()=>{

			beforeEach(async()=>{
				amount = ether(1)	
				result =await exchange.withdrawEther(amount, {from: user1})

			})

			it('tracks ether withdraw', async()=>{
				const balance = await exchange.tokenDB(ETHER_ADDRESS, user1)
				balance.toString().should.equal('0')
			})

			it('emits the Withdraw event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.tokenAddress.should.eq(ETHER_ADDRESS);
				event.user.should.eq(user1);
				event.amount.toString().should.eq(amount.toString());
				event.balance.toString().should.eq('0');		
			})
		})

		describe('Failure', async ()=>{
			
			it('tracks ether withdraw', async()=>{
				
				amount = ether(2)	
				await exchange.withdrawEther(amount, {from: user1}).should.be.rejected
			})

		})

	})

	describe('withdraw token', ()=>{
		let result
		let amount 
		
		// first deposit then withdraw
		
		
		describe('Success', async ()=>{

			beforeEach(async()=>{
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: user1});
				await exchange.depositToken(token.address, amount, {from: user1})
				result = await exchange.withdrawToken(token.address, amount, {from: user1})
			})

			it('tracks token withdraw', async()=>{
				const balance = await exchange.tokenDB(token.address, user1)
				balance.toString().should.equal('0')
			})

			it('emits the Withdraw token event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.tokenAddress.should.eq(token.address);
				event.user.should.eq(user1);
				event.amount.toString().should.eq(amount.toString());
				event.balance.toString().should.eq('0');		
			})

			})
			describe('Failure', async ()=>{

			beforeEach(async()=>{
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: user1});
				await exchange.depositToken(token.address, amount, {from: user1})
				
			})

			it('failure of token withdraw with double amount', async()=>{
				amount = tokens(20)
				await exchange.withdrawToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
		})
		})

	describe('checking balance', ()=>{
		let result
		let amount 

		beforeEach(async()=>{
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: user1});
				await exchange.depositToken(token.address, amount, {from: user1})
			})
		it('returns user balance', async()=>{
			result = await exchange.balanceOf(token.address, user1);
			result.toString().should.equal(amount.toString());
		})

	})

	describe('making order', ()=>{
		let result
		beforeEach(async()=>{
				
				result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
			})
		
		it('tracks newly created order', async()=>{
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal('1');
			const order = await exchange.orders('1');

			order.id.toString().should.eq('1', 'id is correct')
			order.amountGive.toString().should.eq(ether(1).toString(), 'Amount give is correct')
		})

		it('emits the Order  event', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Order');
				const event = log.args;
				event.id.toString().should.eq('1');
				event.amountGive.toString().should.eq(ether(1).toString());
			})

	})

	describe('Order Action', ()=>{
		let result
		beforeEach(async()=>{
				// user1 deposit ether
				await exchange.depositEther({from : user1, value: ether(1)})
				// trasfer 100 tokens by deployer to user 2
				await token.transfer(user2, tokens(100), {from:deployer})
				await token.approve(exchange.address, tokens(2), {from : user2})

				await exchange.depositToken(token.address, tokens(2), {from : user2})
				result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
			})

		
		


		describe('Fill Order Action', ()=>{

			describe('Success', async ()=>{	
				beforeEach(async()=>{
					result = await exchange.fillOrder('1', {from: user2})	
				})

				it('Excutes trade and charge fee', async()=>{
					// check blance of user1, if he received same tokens
					let balance
					balance = await exchange.balanceOf(token.address, user1)

					balance.toString().should.equal(tokens(1).toString(), "user1 got the token 1")

					// user 2 has 100 - 2 tokens
					balance = await exchange.balanceOf(token.address, user2)

					balance.toString().should.equal(tokens(.9).toString(), "user2 got the token .9 (reduced)")

					// user2 got the ether
					balance = await exchange.balanceOf(ETHER_ADDRESS, user2)

					balance.toString().should.equal(ether(1).toString(), "user2 got the ether 1")

					// user1 ether is 0 now
					balance = await exchange.balanceOf(ETHER_ADDRESS, user1)

					balance.toString().should.equal(ether(0).toString(), "user1 have the ether 0(reduced)")

					// exchange fee 
					const feeAccount = await exchange.feeAccount()
					balance = await exchange.balanceOf(token.address, feeAccount)
					balance.toString().should.equal(tokens(.1).toString(), "exchange got the fee .1 (added)")

				})

				it('Fulfils the order ', async()=>{
					const orderFilled = await exchange.orderFilled(1)
					orderFilled.should.eq(true)

				})
				it('emits the trade  event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('Trade');
					const event = log.args;
					event.id.toString().should.eq('1');
					event.amountGive.toString().should.eq(ether(1).toString());
					event.userFill.should.eq(user2)
				})

			})

			describe('Failure', async ()=>{	
				it('rejects the wrong orderId', async()=>{
					const invalidOrderId = 99999
					await exchange.fillOrder(invalidOrderId, {from: user2}).should.be.rejectedWith(EVM_REVERT)	
				})

				it('rejects the order already fulfilled orderId', async()=>{
					await exchange.fillOrder('1', {from: user2}).should.be.fulfilled
					await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)	
				})

				it('rejects the order already canclled orderId ', async()=>{
					
					await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled
					await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)	
				})
			})
		})

		describe('Cancel Order Action', ()=>{

			describe('Success', async ()=>{			
				beforeEach(async()=>{
					result = await exchange.cancelOrder('1', {from: user1})
				})

				it('cancel the Order', async()=>{
					const orderCancelled = await exchange.orderCancelled('1');
					orderCancelled.should.eq(true)
				})

				it('emits the Cancel Order  event', async()=>{
					const log = result.logs[0]
					log.event.should.eq('CancelOrder');
					const event = log.args;
					event.id.toString().should.eq('1');
					event.amountGive.toString().should.eq(ether(1).toString());
				})
			})

			describe('failure', async ()=>{		
				it('cancel the Order with wrong Id', async()=>{
					await exchange.cancelOrder('1000', {from: user1}).should.be.rejected
					
				})

				it('cancel the Order with wrong user ', async()=>{
					await exchange.cancelOrder('1', {from: user2}).should.be.rejected
					
				})
			})

		})
	})

})














