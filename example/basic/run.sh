#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# Deploy the contracts to the specified network
sh 1-run-deploy.sh $NETWORK
sh 2-run-register-example.sh $NETWORK
