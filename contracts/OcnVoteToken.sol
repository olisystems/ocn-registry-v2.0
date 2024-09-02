// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20Permit, Nonces} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract OcnVoteToken is ERC20, ERC20Permit, ERC20Votes {
    uint256 public sMaxSupply = 1000000000000000000000000;
    constructor() ERC20("OcnVoteToken", "OVT") ERC20Permit("OcnVoteToken") {
        _mint(msg.sender, sMaxSupply);
    }

    // Override _update function to resolve inheritance conflict
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes, ERC20) {
        super._update(from, to, amount);
    }

    // Override nonces function to resolve inheritance conflict
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}

