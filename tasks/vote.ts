import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, VOTING_PERIOD } from "../helper-hardhat-config";
import { OcnGovernor } from "../typechain";
import { moveBlocks } from "../helper/moveBlocks";
import { ProposalStorage } from "../helper/storeProposals";
import { int, string } from "hardhat/internal/core/params/argumentTypes";

task("vote", "Vote for a proposal")
  .addOptionalParam("id", "proposal id to vote for", undefined, string)
  .addOptionalParam("way", "against | for | abstain", undefined, int)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    async function vote(proposalId: string, voteWay: number, reason: string) {
      console.log(`Checking proposal state for proposal ${proposalId}...`);
      const ocnGovernor: OcnGovernor = await ethers.getContract("OcnGovernor");

      // Check the current proposal state
      const proposalState = await ocnGovernor.state(proposalId);
      console.log(`Current Proposal State: ${proposalState}`);

      // Check if the proposal is in a state where voting is allowed (state 1 = Active)
      if (proposalState !== BigInt(1)) {
        console.log("Voting is no longer allowed for this proposal. It may have already been executed or is in an invalid state for voting.");
        return;
      }

      console.log(`Voting to proposal ${proposalId}...`);
      const voteTx = await ocnGovernor.castVoteWithReason(proposalId, voteWay, reason);
      const voteTxReceipt = await voteTx.wait(1);
      const eventLogs = voteTxReceipt?.logs.map((log: any) => ocnGovernor.interface.parseLog(log));

      if (!eventLogs || eventLogs.length === 0) {
        throw new Error("No event logs found");
      } else {
        let proposalId = eventLogs[0]?.args?.proposalId;
        let proposalState = await ocnGovernor.state(proposalId);
        console.log(`New Proposal State after voting: ${proposalState}`);

        // If on a development chain, move blocks forward to simulate the voting period
        if (developmentChains.includes(network.name)) {
          await moveBlocks(VOTING_PERIOD + 1, network);
        }

        proposalId = eventLogs[0]?.args?.proposalId;
        proposalState = await ocnGovernor.state(proposalId);
        console.log(`Updated Proposal State after moving blocks: ${proposalState}`);
      }
    }

    const { ethers, network } = hre;
    const proposalStorage = new ProposalStorage();
    const networkName = network.name;
    let proposalId = taskArgs.id;
    const way = taskArgs.way;

    // if no proposal passed, get the last proposal
    proposalId = proposalId ? proposalId : proposalStorage.getLastProposal(networkName)?.proposalId;

    // Check if the proposal exists
    if (!proposalId) {
      console.log(`No proposal found for network ${networkName} with id ${proposalId}`);
      return;
    }

    // 0 = Against, 1 = For, 2 = Abstain for this example
    // if no way passed, vote for the proposal
    const voteWay = way ? way : 1;
    const reason = "OCN Node costs increased";

    // Call the vote function if the proposal exists
    await vote(proposalId, voteWay, reason);
  });
