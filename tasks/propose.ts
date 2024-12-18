import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, VOTING_DELAY, FUNC_SET_FUNDING_YEARLY_AMOUNT, PROPOSAL_DESCRIPTION, NEW_YEARLY_AMOUNT } from "../helper-hardhat-config";
import { OcnGovernor, OcnPaymentManager } from "../typechain";
import { moveBlocks } from "../helper/moveBlocks";
import { ProposalStorage } from "../helper/storeProposals";
import { bigint, string } from "hardhat/internal/core/params/argumentTypes";

task("propose", "Proposes a new yearly funding amount")
  .addOptionalParam("amount", "The new funding yearly amount", undefined, bigint)
  .addOptionalParam("descr", "Description of the proposal", undefined, string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    async function propose(args: any[], functionToCall: string, proposalDescription: string) {
      const ocnGovernor: OcnGovernor = await ethers.getContract("OcnGovernor");
      const ocnPaymentManager: OcnPaymentManager = await ethers.getContract("OcnPaymentManager");
      const encodedFunction = ocnPaymentManager.interface.encodeFunctionData(functionToCall as any, args as any);

      // Check if the proposal has already been made
      if (proposalStorage.getProposalByEncodedFunction(networkName, encodedFunction)) {
        console.log("The exact same proposal has already been made. Skipping the proposal.");
        return;
      }

      console.log(`Proposing: ${encodedFunction} on ${await ocnPaymentManager.getAddress()} with args: ${args}`);
      console.log(`Proposal description: ${proposalDescription}`);

      // Propose the transaction
      const proposalTx = await ocnGovernor.propose([await ocnPaymentManager.getAddress()], [0], [encodedFunction], proposalDescription);

      // If working on a development chain, move forward to the voting period
      if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1, network);
      }

      const proposeReceipt: any = await proposalTx.wait(1);
      const eventLogs = proposeReceipt.logs.map((log: any) => ocnGovernor.interface.parseLog(log));
      const proposalId = eventLogs[0].args.proposalId;

      console.log(`Proposed with proposal ID: ${proposalId}`);

      const proposalState = await ocnGovernor.state(proposalId);
      const proposalSnapShot = await ocnGovernor.proposalSnapshot(proposalId);
      const proposalDeadline = await ocnGovernor.proposalDeadline(proposalId);

      // Save the proposalId and encodedFunction
      proposalStorage.storeProposal(networkName, proposalId.toString(), encodedFunction, proposalDescription);

      console.log(`Current Proposal State: ${proposalState}`);
      console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
      console.log(`Current Proposal Deadline: ${proposalDeadline}`);
      return proposalId;
    }

    const { ethers, network } = hre;
    const proposalStorage = new ProposalStorage();
    const networkName = network.name;

    const amount = taskArgs.amount ? taskArgs.amount : NEW_YEARLY_AMOUNT;
    const description = taskArgs.descr ? taskArgs.descr : PROPOSAL_DESCRIPTION;
    // Call the propose function with appropriate parameters
    return await propose([amount], FUNC_SET_FUNDING_YEARLY_AMOUNT, description);
  });
