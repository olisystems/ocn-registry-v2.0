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
yarn hardhat check-funding --network $NETWORK 
yarn hardhat propose  --network $NETWORK 
yarn hardhat vote  --network $NETWORK
yarn hardhat queue  --network $NETWORK
yarn hardhat execute  --network $NETWORK

echo "Proposal created, voted, queued and executed successfully on blockchain: $NETWORK."
