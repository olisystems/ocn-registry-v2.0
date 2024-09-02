#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run-deploys.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# Deploy the contracts to the specified network
yarn hardhat deploy --network $NETWORK --tags votetoken --reset
yarn hardhat deploy --network $NETWORK --tags timelock
yarn hardhat deploy --network $NETWORK --tags governor
yarn hardhat deploy --network $NETWORK --tags setup
yarn hardhat deploy --network $NETWORK --tags stablecoin
yarn hardhat deploy --network $NETWORK --tags payment-deploy
yarn hardhat deploy --network $NETWORK --tags registry-deploy


echo "All Smart Contracts deployed and configured successfully on blockchain: $NETWORK."
