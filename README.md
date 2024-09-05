# DAO Hardhat Project

## Setup

yarn install

### How to initiate Local networks

- Hardhat localhost: `HARDHAT_CONFIG=local.hardhat.config.ts yarn hardhat node`
- Ganache:

## Fund wallet (Dont need for Hardhat localhost)

- For ganache, execute: `yarn hardhat run scripts/sendBalance.ts --network ganache`
- For external blockchains (mainet or testnet) fund the wallet in .env (WALLET_ADDRESS)

## Deploy Contracts

- Run Ganache in http://127.0.0.1:8544
- Deploy and setup Smart Contracts: `yarn hardhat deploy --network ganache --reset`

## Propose, vote and queue for execution

- Change helper-hardhat-config setting up NEW_YEARLY_AMOUNT
- Verify current box value, should be 0: `yarn hardhat run scripts/get-box-value.ts --network ganache`
- Run propose: `yarn hardhat run scripts/propose.ts --network ganache`
- Run vote: `yarn hardhat run scripts/vote.ts --network ganache`
- Run queue: `yarn hardhat run scripts/queue.ts --network ganache`
- Run execute: `yarn hardhat run scripts/execute.ts --network ganache`
- Verify again box value, should have changed for the value set in NEW_YEARLY_AMOUNT: `yarn hardhat run scripts/propose.ts --network ganache`
