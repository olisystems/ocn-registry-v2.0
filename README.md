# DAO Hardhat Project


## Setup
yarn install

## Deploy Contracts
* Run Ganache in http://127.0.0.1:8544
* Deploy and setup Smart Contracts: `yarn hardhat deploy --network ganache --reset`

## Propose, vote and queue for execution
* Change helper-hardhat-config iterating NEW_STORE_VALUE
* Verify current box value, should be 0: `yarn hardhat run scripts/get-box-value.ts --network ganache`
* Run propose: `yarn hardhat run scripts/propose.ts --network ganache`
* Run vote: `yarn hardhat run scripts/vote.ts --network ganache`
* Run queue: `yarn hardhat run scripts/queue.ts --network ganache`
* Run execute: `yarn hardhat run scripts/execute.ts --network ganache`
* Verify again box value, should have changed for the value set in NEW_STORE_VALUE: `yarn hardhat run scripts/propose.ts --network ganache`