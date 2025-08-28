import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, VOTING_DELAY } from "../helper-hardhat-config";
import { OcnGovernor, OcnRegistry } from "../typechain";
import { moveBlocks } from "../helper/moveBlocks";
import { ProposalStorage } from "../helper/storeProposals";
import { string } from "hardhat/internal/core/params/argumentTypes";

task("proposeSetVerifier", "Proposes to set a new verifier in OcnRegistry")
  .addParam("verifier", "The address of the new verifier")
  .addOptionalParam("descr", "Description of the proposal", undefined, string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, network } = hre;
    const proposalStorage = new ProposalStorage();
    const networkName = network.name;

    const verifierAddress = taskArgs.verifier;
    const functionToCall = "setVerifier";
    const proposalDescription = taskArgs.descr || `Proposal to set new verifier: ${verifierAddress}`;

    const ocnGovernor: OcnGovernor = await ethers.getContract("OcnGovernor");
    const ocnRegistry: OcnRegistry = await ethers.getContract("OcnRegistry");
    const encodedFunction = ocnRegistry.interface.encodeFunctionData(functionToCall, [verifierAddress]);

    // Check if the proposal has already been made
    if (proposalStorage.getProposalByEncodedFunction(networkName, encodedFunction)) {
      console.log("The exact same proposal has already been made. Skipping the proposal.");
      return;
    }

    console.log(`Proposing to call ${functionToCall} on ${await ocnRegistry.getAddress()} with args: [${verifierAddress}]`);
    console.log(`Proposal description: ${proposalDescription}`);

    // Propose the transaction
    const proposalTx = await ocnGovernor.propose([await ocnRegistry.getAddress()], [0], [encodedFunction], proposalDescription);

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
  });
