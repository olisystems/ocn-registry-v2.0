#!/bin/bash

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./scripts/deployment/print-deployment-summary.sh <network>"
  exit 1
fi

NETWORK="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPLOYMENTS_DIR="${REPO_ROOT}/deployments/${NETWORK}"

if [ ! -d "$DEPLOYMENTS_DIR" ]; then
  echo "No deployment directory found for network: ${NETWORK}"
  exit 0
fi

print_contract_address() {
  local contract_name="$1"
  local file_path="${DEPLOYMENTS_DIR}/${contract_name}.json"
  if [ -f "$file_path" ]; then
    local address
    address="$(node -p "require(process.argv[1]).address" "$file_path")"
    printf "  - %-28s %s\n" "${contract_name}:" "${address}"
  fi
}

echo
echo "Deployment summary (${NETWORK}):"
print_contract_address "OcnRegistry"
print_contract_address "PartyRegistrationValidator"
print_contract_address "OcnPaymentManager"
print_contract_address "CertificateVerifier"
print_contract_address "EMSPOracle"
print_contract_address "CPOOracle"
print_contract_address "MockERC20"
print_contract_address "EuroStableCoin"
print_contract_address "OcnGovernor"
print_contract_address "Timelock"
print_contract_address "OcnVoteToken"
