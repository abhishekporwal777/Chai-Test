export const ETHER_ADDRESS= '0x0000000000000000000000000000000000000000'
export const GREEN = 'success'
export const RED = 'danger'

export const DECIMALS =(10**18)

export const ether = (n)=>{
	if (n){
		return n/ DECIMALS
	}
}

export const tokens = ether