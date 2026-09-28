# TheGraph OcnRegistry Indexer
See production deployment in the [Subgraph Explorer](https://thegraph.com/explorer/subgraphs/6cQY2p5PYJYrWMK64aQtK6GYoqqcHABnA8MuBYTma8WT?view=Query&chain=arbitrum-one)

## How it was Setup
```sh
nvm use v22.14.0
npm install -g @graphprotocol/graph-cli@latest
cd ocn-registry-oli
graph codegen && graph build
graph deploy ocn-registry-oli
```
### Adding additional contracts
```sh
graph add 0xf57f26d3CdDcef013db0fA4c0e4EF954dc5D6e5b --abi /home/user/oli/ocn-registry-v2.0/abi/OcnPaymentManager.json
graph add 0x52c0Bc562b58b2818c19A04124C49a35Cc28078B --abi /home/user/oli/ocn-registry-v2.0/abi/EuroStableCoin.json
graph add 0xc3f0e688bD8B4092c093Cb0f1099A7Dc9f7019c8 --abi /home/user/oli/ocn-registry-v2.0/abi/OcnGovernor.json
graph add 0x3469aEcd209dC77AAE1c2b7D1BED360f5DBB1863 --abi /home/user/oli/ocn-registry-v2.0/abi/Ocn
graph codegen && graph build
```
### Gnosis network deployments
```
registry  
0x3469aEcd209dC77AAE1c2b7D1BED360f5DBB1863  
certificateVerifier  
0x789Ee7dA07388810a4B32Ec53ede3Bb6204f76F4  
paymentManager  
0xf57f26d3CdDcef013db0fA4c0e4EF954dc5D6e5b
CPO Oracle
0xDAbE353573BBCEf0d309Ed4bBd807E964E7244A5
EMSPOracle
0x612996BEae716c3D5FE644FF7f0b3bA7c9DF58F2
EuroStableCoin
0x52c0Bc562b58b2818c19A04124C49a35Cc28078B
Ocn Governon
0xc3f0e688bD8B4092c093Cb0f1099A7Dc9f7019c8
OcnVoteToken
0xd78B1BCf2cE9168800b860640e56BB7bae01f8Fc
```