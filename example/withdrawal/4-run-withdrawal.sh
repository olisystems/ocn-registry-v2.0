#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./4-run-withdrawal.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# payment
yarn hardhat send-stable-coins --network $NETWORK
yarn cli pay -p 0x2640750A1d9D9c3137C0096e7e59AE9C368bD4f3 -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -n $NETWORK

echo "Fast forwarding blocks..."
# fast forward blocks in localhost
yarn hardhat ff --blocks 2102400 --network $NETWORK

# withdrawal
yarn cli withdraw -p 0x2640750A1d9D9c3137C0096e7e59AE9C368bD4f3 -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -n $NETWORK
