// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EuroStableCoin is ERC20 {
    uint256 public sMaxSupply = 1_000_000_000000000000000000; // 1 million tokens
    constructor() ERC20("EuroStableCoin", "EURSC") {
        _mint(msg.sender, sMaxSupply);
    }
}

