#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./2-run-deploy.sh <network>"
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

yarn cli set-provider -c DE OLI -r EMSP -t 0123456 -s d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 -n $NETWORK
yarn cli get-provider -c DE OLI -r EMSP -n $NETWORK
