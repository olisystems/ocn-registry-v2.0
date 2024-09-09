import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, VOTING_PERIOD, MIN_DELAY } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";
import { Proposal, ProposalStorage } from "../helper/storeProposals";
import { bigint, int, string } from "hardhat/internal/core/params/argumentTypes";

task("queue", "Queue proposal")
  .addOptionalParam("id", "proposal id to queue", undefined, string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    async function queue(proposal: Proposal) {
      const ocnPaymentManager: any = await ethers.getContract("OcnPaymentManager");
      const descriptionHash = ethers.id(proposal.description);

      const governor: any = await ethers.getContract("OcnGovernor");
      console.log("Queueing...");
      const queueTx = await governor.queue([await ocnPaymentManager.getAddress()], [0], [proposal.encodedFunction], descriptionHash);
      await queueTx.wait(1);

      if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1, network);
        await moveBlocks(1, network);
      }

      const currrentValue = await ocnPaymentManager.getFundingYearlyAmount();
      console.log(`Current Funding Yearly Amount Value: ${currrentValue} at ${await ocnPaymentManager.getAddress()}`);
    }

    const { ethers, network } = hre;
    const proposalStorage = new ProposalStorage();
    let proposalId = taskArgs.id;
    const way = taskArgs.way;

    // if no proposal passed, get the last proposal
    const proposal: Proposal | undefined = proposalId ? proposalStorage.getProposalById(network.name, proposalId) : proposalStorage.getLastProposal(network.name);

    // Check if the proposal exists
    if (!proposal) {
      console.log(`No proposal found for network ${network.name} with id ${proposalId}`);
      return;
    }

    // Call the vote function if the proposal exists
    await queue(proposal);
  });
