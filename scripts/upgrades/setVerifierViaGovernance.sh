#!/bin/bash

# Script to propose, vote, queue, and execute setting a new verifier in OcnRegistry

# --- Configuration ---
DEFAULT_NETWORK="localhost"
PROPOSAL_DESCRIPTION_PREFIX="Proposal to set new verifier: "
VOTE_OPTION=1 # 0 = Against, 1 = For, 2 = Abstain

# --- Helper Functions ---

# Function to display usage instructions
usage() {
  echo "Usage: $0 --verifier <VERIFIER_ADDRESS> [--network <NETWORK_NAME>] [--descr <PROPOSAL_DESCRIPTION>]"
  echo ""
  echo "Arguments:"
  echo "  --verifier <VERIFIER_ADDRESS>   : (Required) The Ethereum address of the new verifier."
  echo "  --network <NETWORK_NAME>        : (Optional) The network to run on (e.g., localhost, mainnet, sepolia). Defaults to '$DEFAULT_NETWORK'."
  echo "  --descr <PROPOSAL_DESCRIPTION>  : (Optional) Custom description for the governance proposal."
  echo ""
  echo "Example:"
  echo "  $0 --verifier 0x123...abc --network localhost --descr \"Add trusted verifier for DID method X\""
  exit 1
}

# --- Argument Parsing ---
VERIFIER_ADDRESS=""
NETWORK="$DEFAULT_NETWORK"
PROPOSAL_DESCRIPTION=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --verifier)
      VERIFIER_ADDRESS="$2"
      shift # past argument
      shift # past value
      ;;
    --network)
      NETWORK="$2"
      shift # past argument
      shift # past value
      ;;
    --descr)
      PROPOSAL_DESCRIPTION="$2"
      shift # past argument
      shift # past value
      ;;
    --help|-h)
      usage
      ;;
    *)
      echo "Unknown parameter passed: $1"
      usage
      ;;
  esac
done

# Validate required arguments
if [ -z "$VERIFIER_ADDRESS" ]; then
  echo "Error: --verifier argument is required."
  usage
fi

# Set default proposal description if not provided
if [ -z "$PROPOSAL_DESCRIPTION" ]; then
  PROPOSAL_DESCRIPTION="${PROPOSAL_DESCRIPTION_PREFIX}${VERIFIER_ADDRESS}"
fi

# --- Main Script Logic ---

echo "🚀 Starting governance process to set verifier: $VERIFIER_ADDRESS on network: $NETWORK"
echo "📝 Proposal Description: $PROPOSAL_DESCRIPTION"
echo "----------------------------------------------------------------------"

# 1. Propose
echo "Step 1: Proposing to set verifier..."
PROPOSE_CMD="npx hardhat proposeSetVerifier --verifier \"$VERIFIER_ADDRESS\" --descr \"$PROPOSAL_DESCRIPTION\" --network \"$NETWORK\""
echo "Executing: $PROPOSE_CMD"
PROPOSE_OUTPUT=$(eval $PROPOSE_CMD)

echo "--- Propose Output ---"
echo "$PROPOSE_OUTPUT"
echo "----------------------"

PROPOSAL_ID=$(echo "$PROPOSE_OUTPUT" | grep "Proposed with proposal ID:" | awk '{print $5}')

if [ -z "$PROPOSAL_ID" ]; then
  echo "❌ Error: Failed to extract Proposal ID from the proposeSetVerifier task output."
  echo "Please check the output above for errors from the Hardhat task."
  exit 1
fi
echo "✅ Proposal created with ID: $PROPOSAL_ID"
echo "----------------------------------------------------------------------"

# 2. Vote
echo "Step 2: Voting on proposal $PROPOSAL_ID (Option: $VOTE_OPTION)..."
VOTE_CMD="npx hardhat vote --proposalid \"$PROPOSAL_ID\" --vote $VOTE_OPTION --network \"$NETWORK\""
echo "Executing: $VOTE_CMD"
VOTE_OUTPUT=$(eval $VOTE_CMD)

echo "--- Vote Output ---"
echo "$VOTE_OUTPUT"
echo "-------------------"
# Basic check for vote success, can be improved based on actual task output
if [[ "$VOTE_OUTPUT" == *"Error"* || "$VOTE_OUTPUT" == *"failed"* ]]; then 
    echo "❌ Error: Voting step may have failed. Please check output."
    # exit 1 # Optionally exit on errori
echo "✅ Vote submitted for proposal ID: $PROPOSAL_ID"
echo "----------------------------------------------------------------------"

# 3. Queue
echo "Step 3: Queueing proposal $PROPOSAL_ID..."
QUEUE_CMD="npx hardhat queue --proposalid \"$PROPOSAL_ID\" --network \"$NETWORK\""
echo "Executing: $QUEUE_CMD"
QUEUE_OUTPUT=$(eval $QUEUE_CMD)

echo "--- Queue Output ---"
echo "$QUEUE_OUTPUT"
echo "--------------------"
if [[ "$QUEUE_OUTPUT" == *"Error"* || "$QUEUE_OUTPUT" == *"failed"* ]]; then 
    echo "❌ Error: Queueing step may have failed. Please check output."
    # exit 1 # Optionally exit on errori
echo "✅ Proposal ID: $PROPOSAL_ID queued."
echo "----------------------------------------------------------------------"

# 4. Execute
echo "Step 4: Executing proposal $PROPOSAL_ID..."
echo "🕒 Note: On a live network, ensure the timelock delay has passed before execution."
EXECUTE_CMD="npx hardhat execute --proposalid \"$PROPOSAL_ID\" --network \"$NETWORK\""
echo "Executing: $EXECUTE_CMD"
EXECUTE_OUTPUT=$(eval $EXECUTE_CMD)

echo "--- Execute Output ---"
echo "$EXECUTE_OUTPUT"
echo "----------------------"
if [[ "$EXECUTE_OUTPUT" == *"Error"* || "$EXECUTE_OUTPUT" == *"failed"* ]]; then 
    echo "❌ Error: Execution step may have failed. Please check output."
    # exit 1 # Optionally exit on errori
echo "✅ Proposal ID: $PROPOSAL_ID executed."
echo "----------------------------------------------------------------------"

echo "🎉 Governance process for setting verifier $VERIFIER_ADDRESS completed."
echo "🔍 Please verify the changes on the OcnRegistry contract on network $NETWORK."
