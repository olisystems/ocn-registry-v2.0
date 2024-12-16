#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./run-register.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# register a node and a party
yarn cli set-node http://localhost:9999 -s 9df16a85d24a0dab6fb2bc5c57e1068ed47d56d7518e9b0eaf1712cae718ded6 -n $NETWORK
# yarn cli set-party -c DE OLI --cert ./example/cpo_certificate.json -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -o 0xB43253229b9d16cE16e9c836B472D84269338808  -n $NETWORK  --name 'local cpo example' --url http://cpo.example.com
yarn cli set-party -c DE OLI --cert ./example/emp_certificate.json -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -o 0xB43253229b9d16cE16e9c836B472D84269338808  -n $NETWORK  --name 'local emp example' --url http://emp.example.com
#yarn hardhat send-stable-coins --network $NETWORK
#yarn cli pay -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -n $NETWORK

# delete a party on emsp behalf with the deployer as spender
SPENDER=d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 yarn cli delete-party-raw -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -n $NETWORK
# set a party again on emsp behalf with the deployer as spender
SPENDER=d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 yarn cli set-party-raw -c BR EMP -r EMSP  -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -o 0xB43253229b9d16cE16e9c836B472D84269338808  -n $NETWORK  --name 'local emp example raw' --url http://emp.example-raw.com
