#!/bin/bash

set -euo pipefail

show_help() {
  cat <<'EOF'
Prod deployment: deploy contracts with oracles and external stablecoin.
Also deploys subgraph with "prod" version label.

Usage:
  ./scripts/deployment/3-deploy-prod-with-external-stablecoin.sh <network> <stablecoin-address>

Arguments:
  <network>            Hardhat network name (e.g. gnosis).
  <stablecoin-address> Existing ERC20 address to use in payment manager.

Required environment variables:
  DEPLOYER_PRIVATE_KEY  Deployer wallet private key (0x + 64 hex chars).
Optional environment variables:
  GRAPH_DEPLOY_KEY  Graph Studio deploy key (required only for subgraph deployment).
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  show_help
  exit 0
fi

if [ -z "${1:-}" ] || [ -z "${2:-}" ] || [ -n "${3:-}" ]; then
  show_help
  exit 1
fi

NETWORK="$1"
STABLECOIN_ADDRESS="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "$REPO_ROOT"
PREFLIGHT_OUTPUT="$(yarn -s ts-node scripts/deployment/preflight.ts external "$STABLECOIN_ADDRESS")"
echo "$PREFLIGHT_OUTPUT"

SKIP_SUBGRAPH_DEPLOY=0
if [[ "$PREFLIGHT_OUTPUT" == *"GRAPH_DEPLOY_KEY_PRESENT=0"* ]]; then
  SKIP_SUBGRAPH_DEPLOY=1
fi

if [ -f "proposals.json" ]; then
  rm "proposals.json"
fi

yarn hardhat compile --network "$NETWORK"

yarn hardhat deploy --network "$NETWORK" --tags votetoken --reset
yarn hardhat deploy --network "$NETWORK" --tags timelock
yarn hardhat deploy --network "$NETWORK" --tags governor
yarn hardhat deploy --network "$NETWORK" --tags setup
STABLECOIN_ADDRESS="$STABLECOIN_ADDRESS" yarn hardhat deploy --network "$NETWORK" --tags payment
yarn hardhat deploy --network "$NETWORK" --tags certificateverifier
yarn hardhat deploy --network "$NETWORK" --tags oracles
yarn hardhat deploy --network "$NETWORK" --tags partyregistrationvalidator
yarn hardhat deploy --network "$NETWORK" --tags registry

if [ "$SKIP_SUBGRAPH_DEPLOY" -eq 1 ]; then
  echo "Skipping subgraph deployment because GRAPH_DEPLOY_KEY is not set."
else
  sh "$SCRIPT_DIR/deploy-subgraph.sh" prod "$NETWORK" "$STABLECOIN_ADDRESS"
fi
sh "$SCRIPT_DIR/print-deployment-summary.sh" "$NETWORK"

echo "Prod deployment (with external stablecoin $STABLECOIN_ADDRESS) completed on $NETWORK."
