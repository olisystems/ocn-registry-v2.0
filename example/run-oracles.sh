#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run-deploy.sh <network>"
  exit 1
fi

# Remove the proposals.json file if it exists
if [ -f proposals.json ]; then
  echo "Removing proposals.json..."
  rm proposals.json
else
  echo "No proposals.json file found."
fi

# Assign the network parameter to a variable
NETWORK=$1
