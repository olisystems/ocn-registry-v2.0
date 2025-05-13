#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./1-run-deploy.sh <network>"
  exit 1
fi

# Remove the proposals.json file if it exists
if [ -f ../../proposals.json ]; then
  echo "Removing proposals.json..."
  rm ../../proposals.json
else
  echo "No proposals.json file found."
fi

# Assign the network parameter to a variable
NETWORK=$1

# Compile the contracts
yarn hardhat compile --network $NETWORK

# Deploy the contracts to the specified network
yarn hardhat deploy --network $NETWORK --tags votetoken --reset
yarn hardhat deploy --network $NETWORK --tags timelock
yarn hardhat deploy --network $NETWORK --tags governor
yarn hardhat deploy --network $NETWORK --tags setup
yarn hardhat deploy --network $NETWORK --tags stablecoin
yarn hardhat deploy --network $NETWORK --tags payment
yarn hardhat deploy --network $NETWORK --tags certificateverifier
yarn hardhat deploy --network $NETWORK --tags oracles
yarn hardhat deploy --network $NETWORK --tags registry

echo "All Smart Contracts deployed and configured successfully on blockchain: $NETWORK."
