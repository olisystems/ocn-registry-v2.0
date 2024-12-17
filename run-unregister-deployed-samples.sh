#!/bin/bash

# Check if network parameter is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <network> [ocn_registry_address]"
  exit 1
fi

NETWORK=$1
OCN_REGISTRY=""
if [ -z "$2" ]; then
  OCN_REGISTRY="-r $2"
fi

# register a node and a party
yarn cli delete-node -s 9df16a85d24a0dab6fb2bc5c57e1068ed47d56d7518e9b0eaf1712cae718ded6 -n $NETWORK $OCN_REGISTRY
yarn cli delete-party -s 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50 -n $NETWORK $OCN_REGISTRY
yarn cli delete-party -s 2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d -n $NETWORK $OCN_REGISTRY
yarn cli delete-party -s 077cfd99ad3bfdddf058e58054eefc6b9f5e22cdaa66c2b7d3c5277f2248020f -n $NETWORK $OCN_REGISTRY
yarn cli delete-party -s 2b5268eec14cef1ef9faa78b5278b6e09583df9279d34e858dea1892b8ab3c05 -n $NETWORK $OCN_REGISTRY
yarn cli delete-party -s e850bdd26c05be1a288291290c2523e821161fb017596c0c9076149cf572411e -n $NETWORK $OCN_REGISTRY
