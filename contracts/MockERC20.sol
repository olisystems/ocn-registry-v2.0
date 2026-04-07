// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint256 public faucetAmount;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_, uint256 faucetAmount_) ERC20(name_, symbol_) {
        faucetAmount = faucetAmount_;
        _mint(msg.sender, initialSupply_);
    }

    function faucet(address to) external {
        _mint(to, faucetAmount);
    }

    function setFaucetAmount(uint256 newAmount) external {
        faucetAmount = newAmount;
    }
}
