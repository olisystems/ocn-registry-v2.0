#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run-all.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# Deploy the contracts to the specified network
yarn hardhat deploy --network $NETWORK --reset

# Run the propose script
yarn hardhat run scripts/propose.ts --network $NETWORK

# Run the vote script
yarn hardhat run scripts/vote.ts --network $NETWORK

# Run the queue script
yarn hardhat run scripts/queue.ts --network $NETWORK

# Run the execute script
yarn hardhat run scripts/execute.ts --network $NETWORK

# Run the script to get the box value
yarn hardhat run scripts/get-box-value.ts --network $NETWORK

echo "All scripts executed successfully on network: $NETWORK."
