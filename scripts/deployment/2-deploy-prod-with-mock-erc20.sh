#!/bin/bash

set -euo pipefail

show_help() {
  cat <<'EOF'
Prod deployment: deploy contracts with oracles, using MockERC20.
Also deploys subgraph with "prod" version label.

Usage:
  ./scripts/deployment/2-deploy-prod-with-mock-erc20.sh <network>

Arguments:
  <network>  Hardhat network name (e.g. chiado, gnosis).

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

if [ -z "${1:-}" ] || [ -n "${2:-}" ]; then
  show_help
  exit 1
fi

NETWORK="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "$REPO_ROOT"

# Load .env so shell-level preflight checks see the same vars as Hardhat.
PREFLIGHT_OUTPUT="$(yarn -s ts-node scripts/deployment/preflight.ts mock)"
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
yarn hardhat deploy --network "$NETWORK" --tags mockstablecoin
STABLECOIN_ADDRESS="" STABLECOIN_DEPLOYMENT_NAME=MockERC20 yarn hardhat deploy --network "$NETWORK" --tags payment
yarn hardhat deploy --network "$NETWORK" --tags certificateverifier
yarn hardhat deploy --network "$NETWORK" --tags oracles
yarn hardhat deploy --network "$NETWORK" --tags partyregistrationvalidator
yarn hardhat deploy --network "$NETWORK" --tags registry

if [ "$SKIP_SUBGRAPH_DEPLOY" -eq 1 ]; then
  echo "Skipping subgraph deployment because GRAPH_DEPLOY_KEY is not set."
else
  sh "$SCRIPT_DIR/deploy-subgraph.sh" prod "$NETWORK"
fi
sh "$SCRIPT_DIR/print-deployment-summary.sh" "$NETWORK"

echo "Prod deployment (with mock ERC20) completed on $NETWORK."
