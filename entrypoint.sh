#!/bin/sh

# Check if WALLET_PRIVATE_KEY is set
if [ -z "$WALLET_PRIVATE_KEY" ]; then
  echo "WALLET_PRIVATE_KEY is not set. Exiting."
  exit 1
fi

# Start Ganache with the specified private key and port
ganache-cli --account="$WALLET_PRIVATE_KEY,10000000000000000000000" --port 8544