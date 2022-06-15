pragma solidity ^0.5.0;
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import "./Token.sol";

contract Exchange{
	using SafeMath for uint;
	address public feeAccount;
	uint256 public feePercent;
	mapping (address => mapping (address => uint256)) public tokenDB;
	mapping (uint256 => _Order) public orders;
	mapping (uint256 => bool) public orderCancelled;
	mapping (uint256 => bool) public orderFilled;
	uint256 public orderCount;

	address constant ETHER = address(0); // ether mapping for tokens


	// event
	event Deposit(address tokenAddress, address user, uint256 amount, uint256 balance);
	event Withdraw(address tokenAddress, address user, uint256 amount, uint256 balance);

	event Order (
		uint id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint timestamp
	);

	event Trade (
		uint id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		address userFill,
		uint timestamp
	);

	event CancelOrder (
		uint256 id,
		address user,
		address tokenGet,
		uint256 amountGet,
		address tokenGive,
		uint256 amountGive,
		uint timestamp
	);

	struct _Order {
		uint id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint timestamp;
	}

	constructor (address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// reverts the ether sent to this smart contract
	function () external{
		revert();
	}
	function depositEther() payable public{
		
		tokenDB[ETHER][msg.sender] = tokenDB[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokenDB[ETHER][msg.sender]);
	}

	function withdrawEther(uint256 _amount) public{
		require(tokenDB[ETHER][msg.sender] >= _amount);
		tokenDB[ETHER][msg.sender] = tokenDB[ETHER][msg.sender].sub(_amount);
		msg.sender.transfer(_amount);
		emit Withdraw(ETHER, msg.sender, _amount, tokenDB[ETHER][msg.sender]);
	}

	// first approve these token then depoist
	function depositToken(address _token, uint256 _amount) public{
		require(_token != ETHER);
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		tokenDB[_token][msg.sender] = tokenDB[_token][msg.sender].add(_amount);
		emit Deposit(_token, msg.sender, _amount, tokenDB[_token][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public{
		require(_token != ETHER);
		require(tokenDB[_token][msg.sender] >= _amount);
		//TODO: WHY I CNA NOT DO THIS
		//require(Token(_token).transferFrom(address(this), msg.sender, _amount));
		require(Token(_token).transfer(msg.sender, _amount));
		tokenDB[_token][msg.sender] = tokenDB[_token][msg.sender].sub(_amount);
		emit Withdraw(_token, msg.sender, _amount, tokenDB[_token][msg.sender]);	
	}

	function balanceOf(address _token, address _user) public view returns (uint256){
		return tokenDB[_token][_user] ;
	}

	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public{
		// must be my order and a valid order
		_Order storage _order = orders[_id];
		require(address(_order.user) == msg.sender);
		require(_order.id == _id);
		orderCancelled[_id] = true;


		emit CancelOrder(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);

	}

	function fillOrder(uint256 _id) public{
		// must be my order and a valid order
		require(_id > 0 &&  _id <= orderCount);
		require(!orderFilled[_id]);
		require(!orderCancelled[_id]);
		
		
		_Order storage _order = orders[_id];
		
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
		
		orderFilled[_id] = true; 
	}

	function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
		
		uint256 _feeAmount = _amountGet.mul(feePercent).div(100);

		tokenDB[_tokenGet][msg.sender] = tokenDB[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
		tokenDB[_tokenGet][_user] = tokenDB[_tokenGet][_user].add(_amountGet);

		tokenDB[_tokenGet][feeAccount] = tokenDB[_tokenGet][feeAccount].add(_feeAmount);

		tokenDB[_tokenGive][_user] = tokenDB[_tokenGive][_user].sub(_amountGive);
		tokenDB[_tokenGive][msg.sender] = tokenDB[_tokenGive][msg.sender].add(_amountGive);

		emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
	}
}