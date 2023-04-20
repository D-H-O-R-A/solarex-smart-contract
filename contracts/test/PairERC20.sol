pragma solidity =0.5.17;

import '../SolarexSwapERC20.sol';

contract PairERC20 is SolarexSwapERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}
