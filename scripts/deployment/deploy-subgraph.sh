#!/bin/bash

set -euo pipefail

show_help() {
  cat <<'EOF'
Deploy subgraph to Graph Studio.

Usage:
  ./scripts/deployment/deploy-subgraph.sh <dev|int|prod> <network> [stablecoin-address]

Arguments:
  <dev|int|prod>  Deployment target mapped to a fixed subgraph:
                  - dev  -> oli-ocn-registry-dev
                  - int  -> oli-ocn-registry-int
                  - prod -> oli-ocn-registry
  <network>       Hardhat network folder name used in deployments/<network>.
  [stablecoin-address]  Optional override for EuroStableCoin datasource address.

Environment variables:
  GRAPH_DEPLOY_KEY  Graph Studio deploy key (required only when this script is executed).
  GRAPH_VERSION_LABEL  Version label to deploy (e.g. v0.0.8). If not set, script prompts for it.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  show_help
  exit 0
fi

if [ -z "${1:-}" ] || [ -z "${2:-}" ] || [ -n "${4:-}" ]; then
  show_help
  exit 1
fi

DEPLOY_ENV="$1"
NETWORK="$2"
STABLECOIN_ADDRESS_OVERRIDE="${3:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SUBGRAPH_DIR="${REPO_ROOT}/thegraph-indexer/ocn-registry-oli"

# Load .env so this script can read GRAPH_DEPLOY_KEY
if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$REPO_ROOT/.env"
  set +a
fi

case "$DEPLOY_ENV" in
  dev)
    GRAPH_NAME="oli-ocn-registry-dev"
    ;;
  int)
    GRAPH_NAME="oli-ocn-registry-int"
    ;;
  prod)
    GRAPH_NAME="oli-ocn-registry"
    ;;
  *)
    echo "Invalid environment: $DEPLOY_ENV"
    show_help
    exit 1
    ;;
esac

if [ ! -d "$SUBGRAPH_DIR" ]; then
  echo "Subgraph directory not found: $SUBGRAPH_DIR"
  exit 1
fi

cd "$REPO_ROOT"
yarn -s ts-node scripts/deployment/update-subgraph-yaml.ts "$NETWORK" "$STABLECOIN_ADDRESS_OVERRIDE"

if [ -z "${GRAPH_DEPLOY_KEY:-}" ]; then
  echo "GRAPH_DEPLOY_KEY is missing. Cannot deploy subgraph."
  exit 1
fi

if [ -z "${GRAPH_VERSION_LABEL:-}" ]; then
  read -r -p "Enter Graph version label (e.g. v0.0.8): " GRAPH_VERSION_LABEL
fi

if [ -z "${GRAPH_VERSION_LABEL:-}" ]; then
  echo "GRAPH_VERSION_LABEL is required. Aborting."
  exit 1
fi

VERSION_LABEL="$GRAPH_VERSION_LABEL"
echo "Using Graph version label: $VERSION_LABEL"

cd "$SUBGRAPH_DIR"

npm run codegen
npm run build
echo "Deploying subgraph to Graph Studio"
graph deploy --node https://api.studio.thegraph.com/deploy/ "$GRAPH_NAME" --deploy-key="$GRAPH_DEPLOY_KEY" --version-label="$VERSION_LABEL"

echo "Subgraph deployed: $GRAPH_NAME (version label: $VERSION_LABEL)"
