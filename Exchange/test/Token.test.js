import { tokens, EVM_REVERT, EVM_INVALID_ADDRESS_REVERT, EVM_INVALID_ADDRESS_APPROVE_REVERT, ETHER_ADDRESS } from './helpers.js'
// import works with babel libs and have preset and in truffle-config
const Token = artifacts.require('./Token')



require('chai')
	.use(require('chai-as-promised'))
	.should()


contract ('Token', ([deployer, receiver, exchange])=>{


	let token;
	const totalSupply = tokens(10000000);
	beforeEach(async()=>{
		// fatch token from blockchain
		token = await Token.new();
	})
	describe('deployment', ()=>{
		it('tracks the name', async ()=>{
			
			//read token name
			const result = await token.name();
			result.should.equal('AADT') 
		})

		it('tracks the Symbol', async ()=>{
			//read token symbol
			const result = await token.symbol();
			result.should.equal('AADT') 
		})

		it('tracks the decimals', async ()=>{
			//read token symbol
			const result = await token.decimals();
			result.toString().should.equal('18') 
		})

		it('tracks the total sypply', async ()=>{
			
			//read token symbol
			const result = await token.totalSupply();
			totalSupply.toString().should.equal(result.toString()) 
		})
		it('assignes total supply to deployer', async ()=>{
			
			//read token symbol
			const result = await token.balanceOf(deployer);
			totalSupply.toString().should.equal(result.toString()) 
		})

	})

	describe('transfer token', ()=>{
		let amount
		let result

		describe ('Success', async ()=>{

			beforeEach(async()=>{
			//read balance before transfer
			// balanceOf = await token.balanceOf(deployer);
			// console.log('balance of deployer before transfer', balanceOf.toString());
			// balanceOf = await token.balanceOf(receiver);
			// console.log('balance of receiver before transfer', balanceOf.toString());

			amount = tokens(10)
			//transefer
			result = await token.transfer(receiver, amount, {from: deployer});


		})
		it('Checking token balance', async ()=>{
			let balanceOf;
			
    
			//read balance 	after transfer
			balanceOf = await token.balanceOf(deployer);
			balanceOf.toString().should.equal(tokens(9999990).toString());
			console.log('balance of deployer after transfer', balanceOf.toString());
			balanceOf = await token.balanceOf(receiver);
			balanceOf.toString().should.equal(tokens(10).toString());
			console.log('balance of receiver after transfer', balanceOf.toString());

		})

		it('emits the transfer event', async()=>{
			const log = result.logs[0]
			log.event.should.eq('Transfer');
			const event = log.args;
			event[0].should.eq(deployer);
			event[1].should.eq(receiver);
			event[2].toString().should.eq(amount.toString());		
		})
		})
		
		describe ('failure', async ()=>{
			it('It rejects insufficnet balances', async ()=>{
				let invalidAmount
				invalidAmount = tokens(100000000);
				
				//transefer
				await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT);

				//transefer
				await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT);

			})
			it('It rejects with invalid address', async ()=>{
				await token.transfer(0x0, amount, {from: deployer}).should.be.rejectedWith(EVM_INVALID_ADDRESS_REVERT);
			})
		})
	})

	describe('Approve token', ()=>{
		let amount
		let result

		beforeEach(async ()=>{
			amount = tokens(1)
			result = await token.approve(exchange, amount, {from: deployer})
		})
		describe ('Success', async ()=>{
			it('allocates the allowance to delegated token spending on exchange', async()=>{
				//approve then allowance and then transferFrom
				const allowance = await token.allowance(deployer, exchange);
				allowance.toString().should.equal(amount.toString());
			})

			it('It emits Approval event on  approve command', async()=>{
				const log = result.logs[0]
				log.event.should.eq('Approval');
				const event = log.args;
				event[0].should.eq(deployer, 'Owner is correct');
				event[1].should.eq(exchange, 'Exchange is correct');
				event[2].toString().should.eq(amount.toString(), 'Value is correct');
			})
		})

		describe ('Failure', async ()=>{
			it('It rejects with invalid address', async ()=>{
				await token.approve(ETHER_ADDRESS, amount, {from: deployer}).should.be.rejectedWith(EVM_INVALID_ADDRESS_APPROVE_REVERT);
			})
		})

		})

		describe('delegated transfer From token', ()=>{
		let amount
		let result

		beforeEach(async()=>{
			
			amount = tokens(10)
			await token.approve(exchange, amount, {from: deployer});
		})
		describe ('Success', async ()=>{

			beforeEach(async()=>{

			amount = tokens(10)
			//transefer
			result = await token.transferFrom(deployer, receiver, amount, {from: exchange});

		})
		it('Checking token balance', async ()=>{
			let balanceOf;
			
    
			//read balance 	after transfer
			balanceOf = await token.balanceOf(deployer);
			balanceOf.toString().should.equal(tokens(9999990).toString());
			console.log('balance of deployer after transfer', balanceOf.toString());
			balanceOf = await token.balanceOf(receiver);
			balanceOf.toString().should.equal(tokens(10).toString());
			console.log('balance of receiver after transfer', balanceOf.toString());

		})
		it('Check the allowance after transferFrom', async()=>{
				//approve then allowance and then transferFrom
				const allowance = await token.allowance(deployer, exchange);
				allowance.toString().should.equal('0');
			})
		it('emits the transfer event', async()=>{
			const log = result.logs[0]
			log.event.should.eq('Transfer');
			const event = log.args;
			event[0].should.eq(deployer);
			event[1].should.eq(receiver);
			event[2].toString().should.eq(amount.toString());		
		})
		})
		
		describe ('failure', async ()=>{
			it('It rejects insufficnet balances', async ()=>{
				let invalidAmount
				invalidAmount = tokens(100000);
				
				//transefer
				await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT);

				//transefer
				await token.transferFrom(receiver, deployer, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_REVERT);

			})
			
			it('It rejects with invalid From (deployer) address', async ()=>{
				await token.transferFrom(ETHER_ADDRESS, receiver, amount, {from: exchange}).should.be.rejected;
			})
		})
	})

	})