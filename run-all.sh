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
sh run-deploys.sh $NETWORK 
sh run-governance.sh $NETWORK