#!/bin/bash

# Stop the script if any command fails
set -e

# Check if a network parameter is provided
if [ -z "$1" ]; then
  echo "No network specified. Usage: ./3-run-register.sh <network>"
  exit 1
fi

# Assign the network parameter to a variable
NETWORK=$1

# register a node and a party
yarn cli set-node http://localhost:9999 -s 9df16a85d24a0dab6fb2bc5c57e1068ed47d56d7518e9b0eaf1712cae718ded6 -n $NETWORK
yarn cli set-party -c DE OLI --cert ./example/emp_certificate.json -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -o 0xB43253229b9d16cE16e9c836B472D84269338808  -n $NETWORK  --name 'local emp example' --url http://emp.example.com
