#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run-governance.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# propose, vote, queue and execute a sample proposal
yarn hardhat run scripts/getFundingYearlyAmount.ts --network $NETWORK 
yarn hardhat run scripts/propose.ts --network $NETWORK 
yarn hardhat run scripts/vote.ts --network $NETWORK
yarn hardhat run scripts/queue.ts --network $NETWORK
yarn hardhat run scripts/execute.ts --network $NETWORK

echo "Proposal created, voted, queued and executed successfully on blockchain: $NETWORK."
