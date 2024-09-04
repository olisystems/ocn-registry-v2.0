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
yarn ts-node src/cli set-node http://localhost:9999 -s d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 -n localhost 
yarn ts-node src/cli set-party -c BR CPO -r CPO  -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -o 0xdD3D370a673cfdCfB0c4cA2a3fE313e1559d1fdc  -n localhost --name 'local cpo exp1' --url 'http://cpo.example.com' 
yarn ts-node src/cli set-party -c BR EMP -r EMSP  -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -o 0xdD3D370a673cfdCfB0c4cA2a3fE313e1559d1fdc  -n localhost --name 'local emp exp1' --url 'http://emp.example.com' 
