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

# register a node and a party
yarn hardhat run scripts/setNode.ts --network $NETWORK 
yarn hardhat run scripts/setParty.ts --network $NETWORK 
