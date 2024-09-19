// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IProviderOracle {
    struct Provider {
        string name;
        string identifier;
    }

    function getProvider(string memory identifier) external view returns (Provider memory);
}
